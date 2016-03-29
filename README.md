# powerservice
Nodejs application for presenting 'live' Watts production from a wind turbine in a dynamic chart.

Uses Chart.js dynamic graph to plot the 'live' data received from a socket that is listening to data being added to a Mongo DB 
tailable cursor.

app.js has a 'client' which posts random data to the application.

The intention is for an microcontroller that is monitoring the power usage to post json data to the server, which inserts the data
into a MondgoDB capped collection. A subscriber to the collection then emits the data using socket.io, and all subscribers will 
update the Chart.js chart with the new data.


