var lineData = {
  labels: ['', '', '', '',
           '', '', '', ''],
  datasets: [{
    fillColor: 'rgba(0,0,0,0)',
    strokeColor: 'rgba(220,180,0,1)',
    pointColor: 'rgba(220,180,0,1)',
    data: [0, 0, 0, 0,
           0, 0, 0, 0]
  }]
}

var ctx = document.getElementById('canvas').getContext('2d');
var total  = document.getElementById('total');
var lineDemo = new Chart(ctx).Line(lineData);

var socket = io.connect('http://localhost:4200');

socket.on('connect', function(data) {
   socket.emit('join', 'Hello World from client');
});

socket.on('data', function(data) {
   lineDemo.removeData();

   var currentTime = new Date(data.date);

   lineDemo.addData([data.value], currentTime.toDateString() + " " + currentTime.toTimeString());
   total.innerHTML = data.totalWatts;
   $("#total").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
});
