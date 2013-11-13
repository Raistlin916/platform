var models = require('../model/schema')
, authenticate = require('./authenticate')
, util = require('../util')
, md5 = util.md5
, path = require('path')
, Q = require('Q');


/*** handle post routes ***/

function savePost(req, res){
  var gid = req.params.gid, uid = req.session.uid;

  var newPost = new models.Post({
        author: uid,
        date: new Date,
        content: req.body.content,
        img: (function(){
          var imagePath = ((req.files || {}).imageData || {}).path;
          if(imagePath == undefined){
            return undefined;
          }
          return path.basename(imagePath);
        })()
      });

  Group.update({ _id: gid }, { $push: { posts: newPost } }).exec()
    .then(function(){
      var d = Q.defer();
      newPost.populate('author', 'email username -_id', function(err, doc){
        err ? d.reject(err) : d.resolve(doc);
      });
      return d.promise;
    })
    .then(function(doc){
      res.send(200, doc);
    }, function(reason){
      console.log(reason);
      res.send(500);
    });
}

function listPosts(req, res){
  var gid = req.params.gid
  , uid = req.session.uid;

  // 下面这个迁移之前赋值无效，迁移之后无法查询，
  // 赋值要toObject，这样就无法赋值，不知道怎么弄
  var aid = {};
  Group.findById(gid).exec()
    .then(function(group){
      group.posts.map(function(post, i){
        aid[i] = { hasPraised: !!~post.praisedUserList.indexOf(uid) };
      });
      return group;
    })
    .then(function(group){
      var d = Q.defer();
      group.populate('posts.author posts.praisedUserList', 'email username -_id', function(err, doc){
        err ? d.reject(err) : d.resolve(doc.posts);
      });
      return d.promise;
    })
    .then(function(posts){
      posts = posts.toObject().map(function(p, i){
        return util.extend(p, aid[i]);
      });
      res.send(posts);
    }, function(reason){
      console.log(reason);
      res.send(500);
    });
}

function deletePost(req, res){
  var gid = req.params.gid, uid = req.session.uid, pid = req.params.pid;

  // 怎么合并查询和删除
  Group.find({ _id: gid })
    .where('posts').elemMatch({ _id: pid, author: uid })
    .exec()
    .then(function(docs){
      if(docs.length == 0){
        return Q.reject(401);
      }
      // 下面总是返回1，即使author不对
      return Group.update({ _id: gid }, {$pull: {posts: { _id: pid, author: uid }}}).exec();
    }).then(function(){
      res.send(200);
    }, function(reason){
      res.send(500, reason);
    });


}


/*** handle user routes ***/
var User = models.User;

function saveUser(req, res){
  if(req.body.pw == null || req.body.username == null){
    res.send(403, '缺少必要信息');
    return;
  }
  var newUser = new User(req.body);
  newUser.pw = md5(newUser.pw);
  newUser.joinDate = new Date;
  newUser.save(function(err){
    if(err){
      return res.send(403, '注册失败');
    };

    // 注册完后加入在线列表
    authenticate.checkin(newUser._id, res)
    .then(function(){
      res.send(newUser);
    }, function(){
      res.send(500);
    });
    
  });
}

function listUsers(req, res){
  User.find(function(err, users){
    res.send(users);
  });
}

function deleteUser(req, res){
  User.findOneAndRemove({ _id: req.params.id }, function (err) {
    if (err) return res.send(500, '删除失败');
    res.send(200);
  });
}

function getUser(req, res){
  User.findOne({_id: req.params.id}, {pw: false}, function (err, doc) {
    err ? res.send(500, '获取失败') : res.send(doc);
  });
}

function updateUser(req, res){
  if(req.session.uid != req.params.id){
    res.send(401);
    return;
  }

  Q.fcall(function(){
    return User.findOne({_id: req.params.id}).exec();
  }).then(function(doc){
    var d = Q.defer();
    doc.email = req.body.email;

    doc.save(function(err){
      err ? d.reject(403) : d.resolve(200);
    });
    return d.promise;
  }).then(function(){
    res.send(200);
  }, function(){
    res.send(500);
  });
}


/*** handle group routes ***/
var Group = models.Group
, UserGroup = models.UserGroup;
function saveGroup(req, res){
  if(req.body.name == null || req.body.desc == null){
    res.send(403, '缺少必要信息');
    return;
  }
  var newGroup = new Group(req.body);
  newGroup.save(function(err, n){
    err ? res.send(403, '创建失败') : res.send(newGroup);
  });
}

function listGroup(req, res){
  Group.find(function(err, groups){
    err ? res.send(500) : res.send(groups);
  });
}

function deleteGroup(req, res){
  Group.findOneAndRemove({ _id: req.params.id }, function (err) {
    err ? res.send(500, '删除失败') : res.send(200);
  });
  UserGroup.remove({gid: req.params.id}, function (err){
    if(err){ console.log(err)};
  });
}

function joinGroup(req, res){
  var gid = req.params.gid
  , uid = req.session.uid;

  UserGroup.findOne({uid: uid, gid: gid}).exec()
  .then(function(doc){
    var d = Q.defer();
    if(doc){
      return d.reject('不能两次跨入同一条河');
    }
  }).then(function(){
    res.send(200);
  }, function(reason){
    res.send(400, reason);
  });
}

function leaveGroup(req, res){
  var gid = req.params.gid
  , uid = req.session.uid;
  if(uid != req.params.uid){
    return res.send(401);
  }

  UserGroup.remove({gid: gid, uid: uid}, function(err){
    res.send(err? 500 : 200);
  });
}

function savePraise(req, res){
  var uid = req.session.uid
  , pid = req.params.pid
  , gid = req.params.gid;
  // http://stackoverflow.com/questions/15921700/mongoose-unique-values-in-nested-array-of-objects
  // 但是用$addToSet无法得到重复添加的警告
  Group.update({ _id: gid, 'posts._id': pid }, {$addToSet: {'posts.$.praisedUserList': uid}})
  .exec().then(function(){
    res.send(200);
  }, function(reason){
    console.log(reason);
    res.send(500, reason);
  });
}

function deletePraise(req, res){

}


exports.init = function(app){

  app.post('/users', saveUser);
  app.get('/users', listUsers);
  app.get('/users/:id', getUser);
  app.post('/users/:id', updateUser);
  app.delete('/users/:id', deleteUser);

  app.post('/groups', saveGroup);
  app.get('/groups', listGroup);
  app.post('/groups/:gid/posts', savePost);
  app.get('/groups/:gid/posts', listPosts);
  app.delete('/groups/:gid/posts/:pid', deletePost);
  
  app.delete('/groups/:id', deleteGroup);
  app.post('/groups/:gid/users', joinGroup);
  app.delete('/groups/:gid/users/:uid', leaveGroup);

  app.post('/groups/:gid/posts/:pid/praises', savePraise);
  app.delete('/groups/:gid/posts/:pid/praises/:prid', deletePraise);
}