var models = require('../model/schema')
, Q = require('Q');

var md5 = require('../util').md5;

var ERROR_TIMEOUT = 1;


function login(req, res){
  var username = req.body.username
  , pw = req.body.pw;
  
  Q.fcall(function(){
    if(username == undefined || pw == undefined){
      return Q.reject('缺少信息');
    }
    return models.User.findOne({username: username, pw: md5(pw)}).exec();
  })
  .then(function(u){
    if(u == null){
      return Q.reject('用户名或密码错误');
    }

    return checkin(u._id, res)
      .then(function(){
        res.send('登录成功');
      });
  })
  .then(null, function(error){
    res.send(401, error);
  });

}


// uid加入在线列表
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






function verifyAndReturnInfo(req, res){
  var sid = req.cookies.sid;

  models.OnlineUser.findById(sid).exec()
  .then(function(doc){
    if(doc == null){
      return Q.reject('登录超时');
    }
    return models.User.findById(doc.uid).exec();
  })
  .then(function(user){
    res.send({username: user.username, email: user.email, emailHash: user.emailHash});
  }, function(reason){
    res.send(401, reason);
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


// verify routes
var verifyList = {};

function bindVerify(app){
  for(var method in verifyList){
    verifyList[method].forEach(function(url){
      app[method](url, verify);
    });
  }
}

function verify(req, res, next){
  var sid = req.cookies.sid;
  models.OnlineUser.findById(sid).exec()
  .then(function(doc){
    if(doc == null){
      return Q.reject(ERROR_TIMEOUT);
    }
    if(req.session == null){
      req.session = {};
    }
    req.session.uid = doc.uid;
    next();
  }).then(null, function(reason){
    switch(reason){
      case ERROR_TIMEOUT:
        res.send(401, '验证失败');
      break;
      default:
        res.send(500);
      break;
    }
  });
}

function setVerifyRoutes(v){
  verifyList = v;
}


exports.init = function(app){
  bindVerify(app);

  app.post('/login', login);
  app.post('/logout', logout);
  app.get('/verify', verifyAndReturnInfo);
}

exports.setVerifyRoutes = setVerifyRoutes;
exports.checkin = checkin;