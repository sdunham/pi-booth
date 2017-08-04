var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();
// Spin up server and io instances here, which will be passed to bin/www
// https://onedesigncompany.com/news/express-generator-and-socket-io
var server = require('http').Server(app);
var io = require('socket.io')(server);

var photoPath = process.cwd() + '/photos/';
if(process.argv.length > 2){
  photoPath = process.argv[2];
}
app.set('photoPath', photoPath);
app.use('/photos', express.static(photoPath));

// Check for optional /public/images/brand.* and background.* and save for later use in views
var files = fs.readdirSync(process.cwd() + '/public/images/');
for(var i=0; i<files.length; i++){
  if(files[i].indexOf('brand.') === 0){
    app.set('brandImage', files[i]);
  }
  else if(files[i].indexOf('background.') === 0){
    app.set('backgroundImage', files[i]);
  }
}

// Routing
var index = require('./routes/index')(app);

// Add socket.io object to app to expose it for use elsewhere in the codebase
app.use(function(req, res, next){
  res.io = io;
  next();
});

// Include separate sockets module for socket event handling
require('./sockets/app')(io, app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app:app, server:server};
