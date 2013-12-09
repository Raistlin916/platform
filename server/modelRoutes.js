


exports.init = function(app){

  require('./routes/users').init(app);
  require('./routes/posts').init(app);
  require('./routes/groups').init(app);

}