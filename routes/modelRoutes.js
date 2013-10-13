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
    newPost.populate('author', 'username', function(err, n){
      if(err){
        return res.send(500);
      }
      res.send(n);
    });
  });
}

function listPosts(req, res){
  Q.fcall(function(){
    // populate 如何不返回_id?
    return Micropost.find(null, {'__v': false}).populate('author', 'username').exec();
  }).then(function(posts){
    res.send(posts);
  }).fail(function(){
    res.send(500);
  });
}

function deletePost(req, res){
  Micropost.findOneAndRemove({ _id: req.params.id }, function (err) {
    if (err) return res.send(500, '删除失败');
    res.send('');
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
  newUser.save(function(err){
    if(err){
      return res.send(403, '注册失败');
    };

    // 注册完后加入在线列表
    authenticate.checkin(newUser._id, res)
    .then(function(){
      res.send(newUser);
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
    res.send('');
  });
}



exports.init = function(app){
  app.post('/microposts', savePost);
  app.get('/microposts', listPosts);
  app.delete('/microposts/:id', deletePost);

  app.post('/users', saveUser);
  app.get('/users', listUsers);
  app.delete('/users/:id', deleteUser);
}