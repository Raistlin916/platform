exports.init = function(app){
  app.post('/groups', saveGroup);
  app.get('/groups', listGroup);
  
  app.post('/groups/:id', updateGroup);
  app.delete('/groups/:id', deleteGroup);
  app.post('/groups/:gid/users', joinGroup);
  app.delete('/groups/:gid/users/:uid', leaveGroup);

  uploadPath = app.get('uploadPath')
}

var models = require('../../model/schema')
, fs = require('fs')
, path = require('path')
, Q = require('q')
, util = require('../util')
, imageHandler = require('../util/imageHandler');

var Group = models.Group
, Post = models.Post
, UserGroup = models.UserGroup
, uploadPath;

function removeImage(imageName){
  if(imageName == undefined){
    return;
  }
  var imgPath = path.join(uploadPath, imageName);
  fs.unlink(imgPath, function(err){
      if(err) { return console.log(err); }
    });
}

function saveGroup(req, res){
  var newGroup = new Group(req.body);
  newGroup.bgPath = imageHandler.getPath(req);
  newGroup.createDate = new Date;
  newGroup.save(function(err, n){
    err ? res.send(403, '创建失败') : res.send(newGroup);
  });
}

function listGroup(req, res){
  Group.find().sort('createDate').exec()
  .then(function(doc){
    res.send(doc);
  }, function(){
    res.send(500);
  });
}

function updateGroup(req, res){
  var data = util.pick(req.body, 'desc', 'name')
  , imagePath = imageHandler.getPath(req)
  , query;
  if(imagePath != null || req.body.noPic){
    data.bgPath = req.body.noPic ? "" : imagePath;
    query = Group.findOne({_id: req.params.id}).exec()
    .then(function(doc){
      removeImage(doc.bgPath);
      return  Group.findOneAndUpdate({_id: req.params.id}, data).exec();
    })
  } else {
    query = Group.findOneAndUpdate({_id: req.params.id}, data).exec();
  }

  query.then(function(doc){
    res.send(doc);
  }, function(reason){
    console.log(reason);
    res.send(500);
  });
}

function deleteGroup(req, res){
  var gid = req.params.id;
  Group.findOneAndRemove({_id: gid}).exec()
  .then(function(doc){
    if(doc.bgPath){
      removeImage(doc.bgPath);
    }
    return Post.find({gid: gid}).exec();
  })
  .then(function(posts){
    posts.forEach(function(post){
      if(post.img){
        removeImage(post.img);
      }
    });
    return Post.remove({gid: gid}).exec();
  })
  .then(function(){
    res.send(200);
  }, function(reason){
    console.log(reason);
    res.send(500, reason);
  });
  UserGroup.remove({gid: gid}, function (err){
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