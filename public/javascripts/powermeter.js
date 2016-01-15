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

function pad(number) {
   if (number < 10) {
        return '0' + number;
   }
   return number;
}

var ctx = document.getElementById('canvas').getContext('2d');
var total  = document.getElementById('total');
Chart.defaults.global.responsive = true;
var lineDemo = new Chart(ctx).Line(lineData);

var socket = io.connect('http://localhost:4200');

socket.on('connect', function(data) {
   socket.emit('join', 'Hello World from client');
});

socket.on('data', function(data) {
   lineDemo.removeData();

   var dD = new Date(data.date);
   var formattedTime = pad(dD.getDay())+"/"+pad(dD.getMonth() + 1)+"/"+pad(dD.getFullYear()) + " " + pad(dD.getHours()) + ":" + pad(dD.getMinutes()) + ":" + pad(dD.getSeconds());

   lineDemo.addData([data.value], formattedTime);
   total.innerHTML = data.totalWatts;
   $("#total").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
});
socket.on('error', function(data) {
   alert(data);
});
