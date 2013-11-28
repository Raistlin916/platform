
/**
 * Module dependencies.
 */

var express = require('express')
  , progress = require('./server/progress')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.compress());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({ keepExtensions: true, uploadDir: path.join(__dirname, 'upload') }));
  app.use(express.cookieParser('love'));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'client'), {maxAge: /*86400000*/0}));
  app.use('/upload/', express.static(path.join(__dirname, 'upload')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});



progress.start(app);