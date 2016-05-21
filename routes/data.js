var express = require('express');
var router = express.Router();
var moment = require('moment');

/* GET latest data  */
router.get('/', function(req, res) {
  var db = req.db;
  var data = db.collection('data');

  data.findOne({}, function(e,docs){
        res.json(docs);
   });

});

function pad(number) {
   if (number < 10) {
        return '0' + number;
   }
   return number;
}

/*
 * POST to add data.
 */
router.post('/', function(req, res) {
    var db = req.db;
    var data = db.collection('data');
    var totals = db.collection('totals');

    var newData = req.body;
    console.log(moment(newData.date).isValid());

    if(moment(newData.date).isValid()){

       var dD = new Date(newData.date);
    console.log("dsfdsfdsfsdf", dD);

       //Make the date a Date before inserting into the db
       newData.date = dD;
       var searchDate = pad(dD.getFullYear())+"-"+pad(dD.getMonth() + 1)+"-"+pad(dD.getDate());
   
       console.log("Latest watts: " + newData.watts);
       console.log("Latest volts: " + newData.volts);
       console.log("Latest date: " + newData.date);
       console.log("Search date: " + searchDate);

       totals.findOneAndUpdate(
          { day: searchDate },
          { $set: { day: searchDate }, $inc: { watts: newData.watts }, $max: { maxToday: newData.watts } },
          { upsert: true, returnOriginal : false },
          function(err, r) {
             if(err == null){
               newData.totalWatts = r.value.watts;
               newData.maxWattsToday = r.value.maxToday;
 
               //If sample taken every second, then this value is wattSeconds 
               var wattSeconds = r.value.watts;
               var wattHours = wattSeconds/3600;
               
               var kWH = wattHours/1000;

               console.log("totalWatts value: " + r.value.watts);
               console.log("wattSeconds value: " + wattSeconds);
               console.log("wattHours value: " + wattHours);
               console.log("kWH value: " + kWH);

               newData.kWHToday = kWH;

               data.insert(newData, function(err, result){
                      res.send(
                          (err === null) ? { msg: 'Date inserted' } : { msg: err }
                      );
               });

             } else {
                      res.send(
                          { msg: err }
                      );
	     }
          }
       );

    } else {
           var err = "Invalid date format - not inserted";
           res.send(
               (err === null) ? { msg: '' } : { msg: err }
           );
    }
});

module.exports = router;
