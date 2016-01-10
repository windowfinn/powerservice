var express = require('express');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

// Database
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/turbineservice';

var db;

MongoClient.connect(url, function(err, db){
   console.log("Connected to DB");
   db = db;
});

//var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
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

server.listen(4200);

var subscribe = function(){

  var args = [].slice.call(arguments);
  var next = args.pop();
  var filter = args.shift() || {};

  if('function' !== typeof next) throw('Callback function not defined');

  // connect to MongoDB
  MongoClient.connect(url, function(err, db){

    db.collection('data', function(err, coll) {

      // seek to latest object
      var seekCursor = coll.find(filter).limit(1).sort({ _id: -1 });
      seekCursor.nextObject(function(err, latest) {

        if (latest) {
          filter._id = { $gt: latest._id }
          console.log(filter);
        }

        // create stream and listen
        var stream = coll.find(filter).setCursorOption('numberOfRetries', 10000).addCursorFlag('awaitData', true).addCursorFlag('tailable', true).stream();

        // call the callback
        stream.on('data', next);
      });
    });

  });
};

// new documents will appear in the console
// open socket
io.sockets.on("connection", function (socket) {
   console.log("Client connected");
   subscribe( function(document) {
      //console.log(document);
      socket.emit("data",document);
   });
});

module.exports = app;
