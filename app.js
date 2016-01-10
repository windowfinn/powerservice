var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

// Database
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/turbineservice';

app.use(express.static(__dirname + '/bower_components'));  
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
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
   subscribe( function(document) {
      //console.log(document);
      socket.emit("data",document);
   });
});
