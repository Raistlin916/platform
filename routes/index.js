var path = require('path');


var authenticate = require('./authenticate');

function index(req, res){
  res.render('main');
};


exports.setRoutes = function(app){
  
  
  authenticate.setVerifyRoutes({
    get: [],
    post: ['/microposts', '/users/:id'],
    delete: ['/microposts/:id']
  });

  authenticate.init(app);

  
  require('./debug').init(app);
  require('./modelRoutes').init(app);
  

  app.get('/', index);
}


