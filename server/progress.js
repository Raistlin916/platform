var mongoose = require('mongoose')
, http = require('http')
, path = require('path')
, Q = require('Q')
, routes = require('./routes')
, etherRoute = require('./ether/route')
, db = mongoose.connection
, app;

db.on('connecting', function() {
  console.log('connecting to MongoDB...');
});
db.on('connected', function() {
  console.log('db connected!');
});
db.once('open', function() {
  console.log('db connection opened!');
  setTrulyRoutes(app);
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
    mongoose.connect('localhost', 'platform_db', function(err){
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
  dbHandler.connect();
  http.createServer(app).listen(app.get('port'), function(){
    console.log("http server listening on port " + app.get('port'));
  });
}