var models = require('../model/schema')
, Promise = require('mongoose').Promise;

function reject(reason){
  var p = new Promise;
  p.reject(reason);
  return p;
}

function login(req, res){
  var p = new Promise
  , username = req.body.username
  , pw = req.body.pw
  , user;
  
  p.resolve();
  p.then(function(){
    if(username == undefined || pw == undefined){
      return reject('缺少信息');
    }
    return models.User.findOne({username: username, pw: pw}).exec();
  }).then(function(u){
    if(u == null){
      return reject('用户名或密码错误');
    }
    user = u;

    return checkin(user._id, res)
      .then(function(){
        res.send('登录成功');
      });
  })
  .then(null, function(error){
    res.send(401, error);
  });
}

function checkin(uid, res){
  return models.OnlineUser.findById(uid).exec()
    .then(function(onlineUser){
      if(onlineUser == null){
        onlineUser = new models.OnlineUser({uid: uid});
      }
      onlineUser.loginDate = new Date;
      onlineUser.save();
      res.cookie('sid', onlineUser._id);
    });
}

function valid(req, res){
  var sid = req.cookies.sid;
  console.log(sid);
  models.OnlineUser.findById(sid, function(err, doc){
    if(err){
      res.send(500);
      return;
    }
    if(doc == null){
      res.send(401);
      return;
    }
    res.send('');
  });
}

function logout(req, res){
  var sid = req.cookies.sid;
  models.OnlineUser.findByIdAndRemove(sid, function(err){
    if(err){
      res.send(500);
      return;
    }
    res.clearCookie('sid');
    res.send('');
  });
}

exports.init = function(app){
  app.post('/login', login);
  app.post('/logout', logout);
  app.get('/valid', valid);
}

exports.checkin = checkin;