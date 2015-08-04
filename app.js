'use strict';

var config=require('config');
var express = require('express');
var path = require('path');
var session = require('express-session');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var TrelloProcessor=require('./trelloProcessor.js');
var mongoose=require('mongoose');

var routes=require('./routes/index');
var jobRoutes=require('./routes/jobs');
var reportRoutes=require('./routes/reports');
var trelloRoutes=require('./routes/trello');
var users=require('./routes/users');

var app = express();
var kue = require('kue');
kue.app.listen(4000);

mongoose.connect(config.db);

mongoose.connection.on('connected', function() {
      console.log('connected to mongo db: '+config.db);
    })
    .on('disconnected',function(err){ console.log('disconnected'); })
    .on('error', function(err) {
      console.log('could not connect to mongo db: ',err);
      console.error.bind(console, 'connection error:');
    })
    .once('open', function (callback) { console.log('db opened: ',mongoose.connection.host+':'+mongoose.connection.port);  });

//sessions
app.use(session({
  secret: 'trello baer',
  resave: false,
  saveUninitialized: true
}));

app.use(function (req, res, next) {
  if(!req.session.trello){
    console.log('creating new, empty TrelloProcessor object for session');
    req.session.trello=new TrelloProcessor();
  }

  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/jobs', jobRoutes);
app.use('/reports',reportRoutes);
app.use('/trello', trelloRoutes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
