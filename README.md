# powerservice
Nodejs application for presenting 'live' Watts production from a wind turbine in a dynamic chart.

Uses Chart.js dynamic graph to plot the 'live' data received from a socket that is listening to data being added to a Mongo DB 
tailable cursor.

Note: You must either create the turbineservice.data table as a capped collection, or run the app once, and convert the created table.

i.e.
db.runCommand( { convertToCapped: 'data', size: 100000 })

app.js has a 'client' which posts random data to the application if it is enabled - see env.json.

If running as a remote server set the NODE_ENV property

i.e. NODE_ENV=remote node app.js

The intention is for an microcontroller that is monitoring the power usage to post json data to the server, which inserts the data
into a MondgoDB capped collection. A subscriber to the collection then emits the data using socket.io, and all subscribers will 
update the Chart.js chart with the new data.


