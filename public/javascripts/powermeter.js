var lineData = {
  labels: ['', '', '', '',
           '', '', '', ''],
  datasets: [{
    fillColor: "rgba(220,220,220,0.2)",
    strokeColor: "rgba(220,220,220,1)",
    pointColor: "rgba(220,220,220,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(220,220,220,1)",
    data: [0, 0, 0, 0,
           0, 0, 0, 0]
  },
  {
    fillColor: "rgba(151,187,205,0.2)",
    strokeColor: "rgba(151,187,205,1)",
    pointColor: "rgba(151,187,205,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(151,187,205,1)",
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
var total = document.getElementById('total');
var totalToday = document.getElementById('max');
var kWHToday = document.getElementById('kWH');
Chart.defaults.global.responsive = true;
var lineDemo = new Chart(ctx).Line(lineData);

var socket = io.connect(window.location.host);

socket.on('connect', function(data) {
   socket.emit('join', 'Hello World from client');
});

socket.on('data', function(data) {
   console.log(data); 
   lineDemo.removeData();

   var dD = new Date(data.date);
   var formattedTime = pad(dD.getDay())+"/"+pad(dD.getMonth() + 1)+"/"+pad(dD.getFullYear()) + " " + pad(dD.getHours()) + ":" + pad(dD.getMinutes()) + ":" + pad(dD.getSeconds());

   lineDemo.addData([data.watts, data.volts], formattedTime);
   total.innerHTML = data.totalWatts;
   totalToday.innerHTML = data.maxWattsToday;
   kWHToday.innerHTML = data.kWHToday;
   $("#total").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
});
socket.on('error', function(data) {
   alert(data);
});
