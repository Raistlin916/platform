var path = require('path');


var authenticate = require('./authenticate');

function index(req, res){
  res.sendfile(path.join(__dirname, '../client/partials/main.html'));
};


exports.setRoutes = function(app){
  
  authenticate.setVerifyRoutes({
    get: ['/userGroups/:uid'],
    post: ['/groups/:gid/posts', '/users/:id', '/groups/:gid/users', '/posts/:pid/praises'
          , '/posts/:pid/todo/:tid', '/posts/:pid/todo'],
    delete: ['/groups/:gid/posts/:pid', '/groups/:gid/users/:uid', '/posts/:pid/praises']
  });
  authenticate.setAdminVerifyRoutes({
    post: ['/groups/:gid', '/groups'],
    delete: ['/groups/:gid']
  });
  authenticate.init(app);

  require('./modelRoutes').init(app);
  app.get('*', index);
}


