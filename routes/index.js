var path = require('path')
, jade = require('jade')
, fs = require('fs')
, models = require('../model/schema');

var autoCompiler = require('./helper').autoCompiler;

autoCompiler.setPath(path.join(__dirname, '../views'), path.join(__dirname, '../client/partials'));
autoCompiler.fix(['index', 'login', 'register', 'microposts']);
autoCompiler.start();

function index(req, res){
  autoCompiler.start();
  res.render('index');
};

/*** micropost handler ***/
var Micropost = models.Micropost;

function savePost(req, res){
  var newPost = new Micropost(req.body);
  newPost.save(function(err){
    if(err){
      return res.send(500, '格式错误');
    };
    res.send(newPost);
  });
}

function listPosts(req, res){
  Micropost.find().exec(function(err, posts){
    res.send(posts);
  });
}

function deletePost(req, res){
  Micropost.findOneAndRemove({ _id: req.params.postId }, function (err) {
    if (err) return res.send(500, '删除失败');
    res.send('');
  });
}


/*** user handler ***/
var User = models.User;

function saveUser(req, res){
	console.log(req.body);
  var newUser = new User(req.body);
  newUser.save(function(err){
    if(err){
      return res.send(500, '格式错误');
    };
    res.send(newUser);
  });
}

function listUsers(req, res){
  User.find().exec(function(err, users){
    res.send(users);
  });
}

function deleteUser(req, res){
  User.findOneAndRemove({ _id: req.params.uid }, function (err) {
    if (err) return res.send(500, '删除失败');
    res.send('');
  });
}


exports.setRoutes = function(app){
  app.get('/', index);
  app.post('/microposts', savePost);
  app.get('/microposts', listPosts);
  app.delete('/microposts/:postId', deletePost);

  app.post('/users', saveUser);
  app.get('/users', listUsers);
  app.delete('/users/:uid', deleteUser);
}