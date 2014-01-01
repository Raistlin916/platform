
/**
 * Module dependencies.
 */

var express = require('express')
  , progress = require('./server/progress')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , config = require('./config');

var app = express();


app.configure('development', function(){
  console.log('server runned in development');
  app.use(express.errorHandler());
  app.use(express.static(path.join(__dirname, 'client')));
  app.use('/upload/', express.static(path.join(__dirname, 'upload')));
});

app.configure('production', function(){
  console.log('server runned in production');
  app.use(express.static(path.join(__dirname, 'client'), {maxAge: 86400000}));
  app.use('/upload/', express.static(path.join(__dirname, 'upload'), {maxAge: 86400000}));
});

app.configure(function(){
  app.set('port', process.env.PORT || config.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.compress());
  app.use(express.favicon('client/images/favicon.png'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser({ keepExtensions: true, uploadDir: path.join(__dirname, 'upload') }));
  app.use(express.cookieParser('love'));
  app.use(express.methodOverride());
  app.use(app.router);
});


process.on('exit', function() {
  console.log('bye, %s', new Date);
});

progress.start(app);






