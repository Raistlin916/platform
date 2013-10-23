var path = require('path');


var authenticate = require('./authenticate');

function index(req, res){
  res.render('main');
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


