var path = require('path');

exports.init = function(app, dbHandler){
  app.get('/db', function(req, res){
    res.sendfile(path.join(__dirname, './db.htm'));
  });
  app.post('/startdb', function(req, res){
    dbHandler.connect()
    .then(function(){
      res.send('db start successfully..');
    }, function(){
      res.send('db failed to start..');
    });
  });
  app.get('/*', function(req, res){
    res.sendfile(path.join(__dirname, './err.htm'));
  });
}