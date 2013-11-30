var models = require('../model/schema')
, Q = require('Q')
, fs = require('fs')
, path = require('path');

var md5 = require('../util').md5
, adminList = fs.readFileSync(path.join(__dirname, './admin')) + '';

adminList = adminList.split(',')
  .map(function(item){
    return item.trim();
  });

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
    return models.User.findById(doc.uid, {pw: false}).exec();
  })
  .then(function(user){
    user = user.toObject();
    user.admin = adminList.indexOf(user._id.toString()) != -1;
    res.send(user);
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
var verifyList = {
  normal: null,
  admin: null
};

function bindVerify(app){
  var chmod, method, d;
  for(chmod in verifyList){
    switch(chmod){
      case 'admin': 
        d = deliver(function(session){
          return session.uid != null && session.admin;
        });
        break;
      default:
        d = deliver(function(session){
          return session.uid != null;
        });
    }
    
    for(method in verifyList[chmod]){
      verifyList[chmod][method].forEach(function(url){
        app[method](url, d);
      });
    }
  }
}

function verify(req, res, next){
  var sid = req.cookies.sid;
  models.OnlineUser.findById(sid, function(err, doc){
    if(req.session == null){
      req.session = {};
    }
    if(doc){
      req.session.uid = doc.uid;
      req.session.admin = adminList.indexOf(doc.uid.toString()) != -1;
    }
    next && next();
  });
}

function deliver(determine){
  return function(req, res, next){
    verify(req, res, function(){
      if(determine(req.session)){
        next();
      } else {
        res.send(401, '验证失败');
      }
    });
  }
}

function setVerifyRoutes(list){
  verifyList.normal = list;
}

function setAdminVerifyRoutes(list){
  verifyList.admin = list;
}


exports.init = function(app){
  //app.all('/*', verify);

  bindVerify(app);
  app.post('/login', login);
  app.post('/logout', logout);
  app.get('/verify', verifyAndReturnInfo);
}


exports.verify = verify;
exports.setAdminVerifyRoutes = setAdminVerifyRoutes;
exports.setVerifyRoutes = setVerifyRoutes;
exports.checkin = checkin;
