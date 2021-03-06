var mongoose = require('mongoose')
, http = require('http')
, path = require('path')
, Q = require('q')
, routes = require('./routes')
, etherRoute = require('./ether/route')
, config = require('../config')
, db = mongoose.connection
, fs = require('fs')
, exec = require('child_process').exec
, app;

db.on('connecting', function() {
  console.log('connecting to MongoDB...');
});
db.on('connected', function() {
  console.log('db connected!');
  setTrulyRoutes(app);
});
db.on('error', function(reason){
  console.log(reason);
});
db.once('open', function() {
  console.log('db connection opened!');
});
db.on('reconnected', function () {
  console.log('db reconnected!');
});
db.on('disconnected', function() {
  console.log('db disconnected!');
  setEtherRoutes(app);
});

function clearRoute(app){
  for(var key in app.routes){
    app.routes[key].length = 0;
  }
}

function setEtherRoutes(app){
  clearRoute(app);
  etherRoute.init(app, dbHandler);
}

function setTrulyRoutes(app){
  clearRoute(app);
  routes.setRoutes(app);
  console.log('server start!');
}

var dbHandler = {
  connect: function(){
    var d = Q.defer();
    mongoose.connect('mongodb://' + config.dbLocation + ':' + config.dbPort + '/' + config.dbName, {user: config.dbUser, pass: config.dbPw, server: {auto_reconnect:false} }, function(err){
      if(err){
        mongoose.disconnect();
        d.reject(err);
      } else {
        d.resolve();
      }  
    });
    return d.promise;
  }
}

exports.start = function(eApp){
  app = eApp;
  // 一些初始化设置
  var uploadPath = path.join( __dirname, '../upload');
  fs.existsSync(uploadPath) || fs.mkdir(uploadPath);
  app.set('uploadPath', uploadPath);

  dbHandler.connect();
  
  var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('http server listening on port ' + app.get('port'));
  });
  app.set('server', server);
}