var path = require('path');


var authenticate = require('./authenticate');

function index(req, res){
  res.render('main');
};


exports.setRoutes = function(app){
  
  
  authenticate.setVerifyRoutes({
    get: ['/userGroups/:uid'],
    post: ['/groups/:gid/posts', '/users/:id', '/groups/:gid/users'],
    delete: ['/groups/:gid/posts/:pid', '/groups/:gid/users/:uid']
  });

  authenticate.init(app);

  
  require('./debug').init(app);
  require('./modelRoutes').init(app);
  
  app.get('/', index);
}


