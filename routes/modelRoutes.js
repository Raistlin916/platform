var models = require('../model/schema')
, authenticate = require('./authenticate');


/*** handle micropost routes ***/
var Micropost = models.Micropost;

function savePost(req, res){
  var newPost = new Micropost(req.body);
  newPost.date = new Date;
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
  Micropost.findOneAndRemove({ _id: req.params.id }, function (err) {
    if (err) return res.send(500, '删除失败');
    res.send('');
  });
}


/*** handle user routes ***/
var User = models.User;

function saveUser(req, res){
  var newUser = new User(req.body);
  newUser.save(function(err){
    if(err){
      return res.send(500, '格式错误');
    };
    authenticate.checkin(newUser._id, res)
    .then(function(){
      res.send(newUser);
    });
    
  });
}

function listUsers(req, res){
  User.find().exec(function(err, users){
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