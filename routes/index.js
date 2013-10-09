var path = require('path')
, jade = require('jade')
, fs = require('fs')
, models = require('../model/schema');

var autoCompiler = require('./helper').autoCompiler;

autoCompiler.setPath(path.join(__dirname, '../views'));
autoCompiler.fix('index');

function index(req, res){
  autoCompiler.start();
  res.sendfile(path.join(__dirname, '../views/index.html'));
};


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


exports.setRoutes = function(app){
  app.get('/', index);
  app.post('/microposts', savePost);
  app.get('/microposts', listPosts);
  app.delete('/microposts/:postId', deletePost);
}