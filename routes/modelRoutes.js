var models = require('../model/schema')
, authenticate = require('./authenticate')
, md5 = require('../util').md5
, Q = require('Q');


/*** handle micropost routes ***/
var Micropost = models.Micropost;

function savePost(req, res){
  var newPost = new Micropost(req.body);
  newPost.date = new Date;
  newPost.author = req.session.uid;
  newPost.save(function(err){
    if(err){
      return res.send(403, '格式错误');
    };
    newPost.populate('author', 'email username', function(err, n){
      err ? res.send(500) : res.send(n);
    });
  });
}

function listPosts(req, res){
  Q.fcall(function(){
    // populate 如何不返回_id?
    return Micropost.find(null, {'__v': false}).populate('author', 'email username').exec();
  }).then(function(posts){
    res.send(posts);
  }).fail(function(){
    res.send(500);
  });
}

function deletePost(req, res){
  Micropost.findById(req.params.id).exec()
  .then(function(doc){
    if(!doc.author.equals(req.session.uid)){
      return Q.reject(401);
    }
    doc.remove(function(err){
      err? res.send(500, '删除失败') : res.send(200);
    });
  }).then(null, function(r){
    if(typeof r == 'number'){
      res.send(r);
    } else {
      res.send(500, '删除失败');
    }
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
    err ? res.send(403, '注册失败') : res.send(newGroup);
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
    new UserGroup({uid: uid, gid: gid, joinDate: new Date}).save(function(err){
      err ? d.reject('服务器错误') : d.resolve();
    });
    return d.promise;
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

function listUserGroups(req, res){
  var uid = req.session.uid;
  if(uid != req.params.uid){
    return res.send(401);
  }
  UserGroup.find({uid: uid}, {_id: false, uid: false, joinDate: false}, function(err, doc){
    err ? res.send(500) : res.send(doc);
  });
}


exports.init = function(app){
  app.post('/microposts', savePost);
  app.get('/microposts', listPosts);
  app.delete('/microposts/:id', deletePost);

  app.post('/users', saveUser);
  app.get('/users', listUsers);
  app.get('/users/:id', getUser);
  app.post('/users/:id', updateUser);
  app.delete('/users/:id', deleteUser);

  app.post('/groups', saveGroup);
  app.get('/groups', listGroup);
  app.get('/userGroups/:uid', listUserGroups);
  app.delete('/groups/:id', deleteGroup);
  app.post('/groups/:gid/users', joinGroup);
  app.delete('/groups/:gid/users/:uid', leaveGroup);
}