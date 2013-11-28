var path = require('path');


var authenticate = require('./authenticate');

function index(req, res){
  res.render('main');
};


exports.setRoutes = function(app){
  
  authenticate.setVerifyRoutes({
    get: ['/userGroups/:uid'],
    post: ['/groups/:gid/posts', '/users/:id', '/groups/:gid/users', '/groups/:gid/posts/:pid/praises'],
    delete: ['/groups/:gid/posts/:pid', '/groups/:gid/users/:uid', '/groups/:gid/posts/:pid/praises']
  });
  authenticate.setAdminVerifyRoutes({
    post: ['/groups/:gid', '/groups'],
    delete: ['/groups/:gid']
  });
  authenticate.init(app);

  require('./modelRoutes').init(app);
  app.get('/', index);
}


