var lineData = {
  labels: ['', '', '', '',
           '', '', '', ''],
  datasets: [{
    fillColor: "rgba(17,237,160,0.2)",
    strokeColor: "rgba(255,255,0,1)",
    pointColor: "rgba(255,0,0,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(220,220,220,1)",
    data: [0, 0, 0, 0,
           0, 0, 0, 0]
  }/*,
  {
    fillColor: "rgba(151,187,205,0.2)",
    strokeColor: "rgba(151,187,205,1)",
    pointColor: "rgba(151,187,205,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(151,187,205,1)",
    data: [0, 0, 0, 0,
           0, 0, 0, 0]
  }*/]
}

function pad(number) {
   if (number < 10) {
        return '0' + number;
   }
   return number;
}

function setMeterLevel(number){
   if(number > 0) {
//return ((limitMax - limitMin) * (valueIn - baseMin) / (baseMax - baseMin)) + limitMin;
     var thingy = ((8 - 4) * (number - 0) / (50 - 0)) + 4;

     $('#meter').meter('setLevel', thingy);
   } else {
     var thingy = ((4 - 0) * (number + 1) / (0 + 1)) + 0;

     $('#meter').meter('setLevel', thingy);
   }

}

var ctx = document.getElementById('canvas').getContext('2d');
var total = document.getElementById('total');
//var totalToday = document.getElementById('max');
var currentWatts = document.getElementById('watts');
var kWHToday = document.getElementById('kWH');
var kWHTodayLabel = document.getElementById('kWHLabel');
var currentVolts = document.getElementById('volts');

Chart.defaults.global.responsive = true;
var lineDemo = new Chart(ctx).Line(lineData);

var socket = io.connect(window.location.host);

var pointCount = 0;

socket.on('connect', function(data) {
   socket.emit('join', 'Hello World from client');
});

socket.on('data', function(data) {
   //console.log(data);
   
   if (pointCount > 39) { 
     lineDemo.removeData();
     pointCount--;
   }

   if (pointCount < 8) { 
     lineDemo.removeData();
   }

   var dD = new Date(data.date);

   var formattedTime = "";

   /*if (pointCount == 39) {
       //formattedTime = pad(dD.getDate())+"/"+pad(dD.getMonth() + 1)+"/"+pad(dD.getFullYear()) + " " + pad(dD.getHours()) + ":" + pad(dD.getMinutes()) + ":" + pad(dD.getSeconds());
       formattedTime = pad(dD.getHours()) + ":" + pad(dD.getMinutes()) + ":" + pad(dD.getSeconds());
   }*/

   var kWHFloat = parseFloat(data.kWHToday);

   if (kWHFloat < 0.001) { 
      data.kWHToday = "< 0.001";
      kWHTodayLabel.innerHTML = "kWH Today";
   } else if(kWHFloat < 0.1) { 
      kWHFloat = kWHFloat * 1000;
      kWHTodayLabel.innerHTML = "wH Today";
   } else {
      kWHTodayLabel.innerHTML = "kWH Today";
   }

   lineDemo.addData([data.watts], formattedTime);

   pointCount++;

   total.innerHTML = parseFloat(data.totalWatts).toFixed(2);
   //totalToday.innerHTML = data.maxWattsToday;
   kWHToday.innerHTML = kWHFloat.toFixed(2);
   currentWatts.innerHTML = parseFloat(data.watts).toFixed(2);
   currentVolts.innerHTML = parseFloat(data.volts).toFixed(2);
   $("#total").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);

   setMeterLevel(parseFloat(data.watts));
});

socket.on('error', function(data) {
   alert(data);
});

$('#meter').meter();

$(document).ready(function(){ 
    setInterval(function(){ 
      var level = $('#meter').meter('getLevel');
      if (level != 4) {
        if(level < 4) {
          
	  level = level+0.1;

	  if(level > 4) {
	    level = 4;
	  }

	} else {

	  level = level-0.1;

	  if(level < 4) {
	    level = 4;
	  }

	}
       $('#meter').meter('setLevel', level);
      }
    },200); 
});
