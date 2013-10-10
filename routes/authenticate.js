var models = require('../model/schema')
, Promise = require('mongoose').Promise;

function reject(reason){
  var p = new Promise;
  p.reject(reason);
  return p;
}

function login(req, res){
  var p = models.User.findOne(req.body).exec()
  , user;
  p.then(function(u){
    if(u == null){
      return reject('用户名或密码错误');
    }
    user = u;
    return models.OnlineUser.findOne({uid: user._id}).exec();
  })
  .then(function(onlineUser){
    if(onlineUser == null){
      onlineUser = new models.OnlineUser({uid: user._id});
    }
    onlineUser.save({loginDate: new Date});
    res.cookie('sid', onlineUser._id);
    res.send('登录成功');
  })
  .then(null, function(error){
    console.log(error);
    res.send(401, error);
  });
}

exports.init = function(app){
  app.post('/login', login);
}