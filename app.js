var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

// Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/turbineservice');

app.use(express.static(__dirname + '/bower_components'));  
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});

server.listen(4200);

io.on('connection', function(client) {  
    console.log('Client connected...');

    client.on('join', function(data) {
        console.log(data);
    });

});

var dData = function() {
  return Math.round(Math.random() * 90) + 10;
};

setInterval(function() {

  var newData;
  var collection = db.get('data');

  collection.findOne({}, function(e,docs){
        io.emit('data', docs);
   });

}, 3000);
