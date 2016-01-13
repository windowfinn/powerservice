var express = require('express');
var router = express.Router();
var moment = require('moment');

/* GET latest data  */
router.get('/', function(req, res) {
  var db = req.db;
  var collection = db.collection('data');

  collection.findOne({}, function(e,docs){
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
    var collection = db.collection('data');
    var totals = db.collection('totals');

    var newData = req.body;
    console.log(moment(newData.date).isValid());

    if(moment(newData.date).isValid()){

       var dD = new Date(newData.date);
       var searchDate = pad(dD.getDay())+"/"+pad(dD.getMonth() + 1)+"/"+pad(dD.getFullYear());

       totals.findOneAndUpdate(
          {day: searchDate},
          { $set: { day: searchDate }, $inc: { watts: newData.value } },
          {upsert: true, returnOriginal : false},
          function(err, r) {
             if(err == null){
               newData.totalWatts = r.value.watts;

               collection.insert(newData, function(err, result){
                      res.send(
                          (err === null) ? { msg: 'Date inserted' } : { msg: err }
                      );
               });

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
