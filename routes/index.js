var path = require('path');


var autoCompiler = require('./helper').autoCompiler
, authenticate = require('./authenticate');

autoCompiler.setPath(path.join(__dirname, '../views'), path.join(__dirname, '../client/partials'));
autoCompiler.fix(['index', 'userport', 'microposts']);
autoCompiler.start();

function index(req, res){
  autoCompiler.start();
  res.render('index');
};


exports.setRoutes = function(app){
  
  
  authenticate.setVerifyRoutes({
    get: [],
    post: ['/microposts'],
    delete: ['/microposts/:id']
  });

  authenticate.init(app);

  app.delete('/microposts/:id', function(req, res, next){
    var models = require('../model/schema');
    models.Micropost.findById(req.params.id).exec()
    .then(function(doc){
      doc.author.equals(req.session.uid)
      next();
    }, function(r){
      console.log(r);
    });

  });

  
  require('./debug').init(app);
  require('./modelRoutes').init(app);
  

  app.get('/', index);
}


