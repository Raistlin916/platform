exports.init = function(app){
  app.post('/groups/:gid/posts', savePost);
  app.get('/groups/:gid/posts', listPosts);
  app.delete('/groups/:gid/posts/:pid', deletePost);
  
  app.post('/posts/:pid/todo/:tid', updateTodo);
  app.post('/posts/:pid/todo', saveTodo);

  app.post('/posts/:pid/praises', savePraise);
  app.delete('/posts/:pid/praises', deletePraise);

  uploadPath = app.get('uploadPath');
}

var models = require('../../model/schema')
, authenticate = require('../authenticate')
, fs = require('fs')
, path = require('path')
, util = require('../util')
, Q = require('q')
, Post = models.Post
, ObjectID = require('../../node_modules/mongoose/node_modules/mongodb').ObjectID;

var uploadPath;

function savePost(req, res){
  var gid = req.params.gid, uid = req.session.uid;

  var newPost = new Post({
        author: uid,
        content: req.body.content,
        type: req.body.type,
        gid: gid,
        img: require('../util/imageHandler').getPath(req)
      });

  newPost.todoList = transTodoList(req.body.todoList);

  newPost.save(function(err, doc){
    newPost.populate('author', 'email username', function(err, doc){
      err ? res.send(500) : res.send(doc);
    });
  });
  
}

function transTodoList(orgTodoList){
  return (orgTodoList || []).map(function(item){
    if(typeof item.content != 'string'){
      return null;
    }
    var content = item.content.trim();
    if(!content.length){
      return null;
    }
    var todo = new models.Todo({
      content: content,
      doneAt: item.doneAt,
      hasDone: item.hasDone
    });
    return todo;
  }).filter(function(item){ return item != null; });
}

function listPosts(req, res){
  authenticate.verify(req, res, function(){
    _listPosts(req, res);
  });
}

function _listPosts(req, res){
  var gid = req.params.gid
  , uid = (req.session || {}).uid
  , p = ~~(req.query.p) || 0
  , step = ~~(req.query.step) || 10
  , offset = p * step;

  var aid = {};
  Post.find({gid: gid})
  .sort('-date').skip(offset).limit(step)
  .populate('author praisedUserList', 'email username')
  .exec()
  .then(function(posts){
    // 下面这个怎么合并到query里？
    aid = posts.map(function(post){
      return { 
        hasPraised: post.praisedUserList.some(function(pr){
          return pr._id.toString() == uid;
        }), 
        praisedCount: post.praisedUserList.length,
        praisedUserList: post.praisedUserList.reverse().slice(0, 4)
      };
    });


    var d = Q.defer();
    Post.where('gid', gid).count().exec().then(function(total){
      d.resolve({posts: posts, total: total});
    });

    return d.promise;
  })
  .then(function(data){
    data.posts = data.posts.map(function(p, i){
      return util.extend(p.toObject(), aid[i], true);
    });
    res.send({data: data.posts, total: data.total, p: p, step: step});
  })
  .then(null, function(reason){
    console.log(reason);
    res.send(500);
  });
}

function deletePost(req, res){
  var uid = req.session.uid, pid = req.params.pid;

  // 怎么合并查询和删除
  Post.findOne({_id: pid, author: uid})
    .exec()
    .then(function(doc){
      if(doc == null){
        return Q.reject(401);
      }
      if(doc.img){
        var imgPath = path.join( uploadPath, doc.img);
        fs.unlink(imgPath, function(err){
          if(err) { return console.log(err); }
        });
      }
      var d = Q.defer();
      doc.remove(function(err){
        err ? d.reject(err) : d.resolve();
      });
      return d.promise;
    }).then(function(){
      res.send(200);
    }, function(reason){
      console.log(reason);
      res.send(500, reason);
    });
}

function saveTodo(req, res){
  var pid = req.params.pid
  , uid = req.session.uid;
  Post.findOne({_id: pid, type: 'todo', author: uid}).exec()
  .then(function(doc){
    if(doc == null){
      return res.send(401);
    }
    doc.todoList = transTodoList(req.body.todoList);
    doc.save(function(err, doc){
      err ? res.send(500) : res.send({todoList: doc.todoList});
    });
  });
}

function updateTodo(req, res){
  var tid = req.params.tid
  , uid = req.session.uid;

  // 下面如果用mongoose的ObjectId会导致奇怪的现象 require('mongoose').Schema.ObjectId
  // 应该是个bug
  Post.findOneAndUpdate({'todoList._id': new ObjectID(tid), 'author': uid}, 
    {$set: {'todoList.$.hasDone': req.body.hasDone, 'todoList.$.doneAt': req.body.hasDone ? new Date : null}})
  .where('todoList.$')
  .exec()
  .then(function(doc){
    if(doc == null){
      return res.send(401);
    }
    return Post.findOne({'todoList._id': new ObjectID(tid)}, 'todoList.$').exec()
  })
  .then(function(doc){
    res.send(doc.todoList[0]);
  })
  .then(null, function(reason){
    console.log(reason);
    res.send(500, reason);
  });

}

function savePraise(req, res){
  var uid = req.session.uid
  , pid = req.params.pid;
  // http://stackoverflow.com/questions/15921700/mongoose-unique-values-in-nested-array-of-objects
  // 但是用$addToSet无法得到重复添加的警告
  Post.update({ _id: pid }, {$addToSet: {'praisedUserList': uid}})
  .exec().then(function(){
    res.send(200);
  }, function(reason){
    console.log(reason);
    res.send(500, reason);
  });
}

function deletePraise(req, res){
  var uid = req.session.uid
  , pid = req.params.pid;
  Post.update({ _id: pid }, {$pull: {'praisedUserList': uid}})
  .exec().then(function(){
    res.send(200);
  }, function(reason){
    console.log(reason);
    res.send(500, reason);
  });
}
