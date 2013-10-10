var path = require('path');


var autoCompiler = require('./helper').autoCompiler;

autoCompiler.setPath(path.join(__dirname, '../views'), path.join(__dirname, '../client/partials'));
autoCompiler.fix(['index', 'login', 'register', 'microposts']);
autoCompiler.start();

function index(req, res){
  autoCompiler.start();
  res.render('index');
};


exports.setRoutes = function(app){
  app.get('/', index);

  
  require('./debug').init(app);
  require('./modelRoutes').init(app);
  require('./authenticate').init(app);
}


