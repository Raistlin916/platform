exports.init = function(app){
  app.post('/users', saveUser);
  app.get('/users', listUsers);
  app.get('/users/:id', getUser);
  app.post('/users/:id', updateUser);
  app.delete('/users/:id', deleteUser);
}

var models = require('../../model/schema')
, authenticate = require('../authenticate')
, util = require('../util')
, md5 = util.md5
, Q = require('q')
, User = models.User;

function saveUser(req, res){
  var body = req.body;
  if(body.pw == null || body.username == null || body.email == null){
    res.send(403, '缺少必要信息');
    return;
  }
  body.detail = {
    github: body.github,
    weibo: body.weibo,
    website: body.website
  }
  var newUser = new User(body);
  newUser.pw = md5(newUser.pw);
  newUser.joinDate = new Date;
  newUser.save(function(err){
    if(err){
      return res.send(403, '注册失败');
    };

    // 注册完后加入在线列表
    authenticate.checkin(newUser._id, res)
    .then(function(){
      console.log(newUser);
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

  var body = req.body;

  Q.fcall(function(){
    return User.findOne({_id: req.params.id}).exec();
  }).then(function(doc){
    var d = Q.defer();
    doc.email = body.email;
    doc.detail.weibo = body.detail.weibo;
    doc.detail.github = body.detail.github;
    doc.detail.website = body.detail.website;

    doc.save(function(err, doc){
      err ? d.reject(403) : d.resolve(doc);
    });
    return d.promise;
  }).then(function(doc){
    res.send(doc.toObject());
  }, function(){
    res.send(500);
  });
}
