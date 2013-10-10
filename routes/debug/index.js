var Q = require('Q')
, models = require('../../model/schema');

function debug(req, res){
  res.render( __dirname + '/debug.jade');
}

function db(req, res){
  var ps = [];
  for(var k in models){
    (function(k){
      ps.push(
        models[k].find().exec().then(function(v){
          return {collection: k, data: v};
        })
      );
    })(k);
  }
  Q.all(ps).then(function(a){
    res.send(a);
  }, function(){
    res.send('未知错误');
  });
}

exports.init = function(app){
  app.get('/debug', debug);
  app.get('/db', db);
};