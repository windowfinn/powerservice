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

  // connect to MongoDB
  MongoClient.connect(url, function(err, db){
    
    db.collection('data', function(err, coll) {

    // open socket
    io.sockets.on("connection", function (socket) {
      // open a tailable cursor
      console.log("== open tailable cursor");

       coll.find({}).setCursorOption('numberOfRetries', 10000).addCursorFlag('awaitData', true).addCursorFlag('tailable', true).each(function(err, doc) {
        console.log(doc);
        // send message to client
        socket.emit("data",doc);
      })

    });
            
    });
  });
