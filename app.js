var express = require('express');

var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var data = require('./routes/data');

// Database
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/turbineservice';

var mDb;

MongoClient.connect(url, function(err, db){
   console.log("Connected to DB");
   mDb = db;
});

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
    req.db = mDb;
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/data', data);

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
  //var socket = args.shift();
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

        // remove the callback when a client disconnects
	// is this required as there is only once instance of the stream
	// being listened to, each client creates it's own stream.
        /* 
	socket.on('disconnect', function() {
          console.log("User disconnected!!!!!"); 
          stream.removeListener('data', next);
          stream.close(function(err, result){console.log("Stream closed")});
        });
	*/

      });
    });

  });
};

// open socket
io.sockets.on("connection", function (socket) {
   console.log("Client connected");
  
   //Notify locally connected socket clients
   subscribe( function(document) {
      //console.log(">>>>>>>>>>>>>>>>>>>>>>" + document);

      if(document){

        //Emit the new data to the socket clients
        socket.emit("data",document);
      }
    });
});

//POST the latest data to the remote server
subscribe( function(document) {
      //console.log(">>>>>>>>>>>>>>>>>>>>>>" + document);

      if(document){

        //Post the new data to the remote nodejs app
	var options = {
	    host: 'pacevitch.com',
	    port: 4200,
	    path: '/data/remote',
	    method: 'POST',
	    headers: {
                'Content-Type': 'application/json; charset=utf-8',
	       // 'Content-Length': Buffer.byteLength(document)
	    }
	};

        var req = http.request(options, function(res) {
	    res.on('data', function (chunk) {
	        console.log("body: " + chunk);
	    });
            res.on('error', function(err) {
              console.log(err);
            });
        });

        req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
        });
 
        options.headers['Content-Length'] = document.length;
        req.write(JSON.stringify(document));
        req.end();
      }
});

//Code emulating the Arduino posting data

var options = {
  host: 'localhost',
  port: '4200',
  path: '/data',
  method: 'POST',
  headers: {
      'Content-Type': 'application/json; charset=utf-8',
      //'Content-Length': data.length
  }
};

var dData = function() {
  return Math.round(Math.random() * 90) + 10;
};

setInterval(function() {

  var req = http.request(options, function(res) {
  var msg = '';

  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    msg += chunk;
  });
  res.on('error', function(err) {
    console.log(err);
  });
  res.on('end', function() {
    console.log(JSON.parse(msg));
  });
});

var data = JSON.stringify({
  'watts': dData(),
  'volts': 240,
  'date': new Date()
});

options.headers['Content-Length'] = data.length;
req.write(data);
req.end();

}, 10000);

module.exports = app;
