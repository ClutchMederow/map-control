var fs = require("fs");
var Future = require('fibers/future');
var Fiber = require('fibers');
var SteamBot = require('./app/SteamBot');

// var MongoClient = require('mongodb').MongoClient;
// var ObjectId = require('mongodb').ObjectID;
// var assert = require('assert');

// var url = 'mongodb://localhost:3001/meteor';
// MongoClient.connect(url, function(err, db) {
//   var Bots = db.collection('bots');
//   Bots.find().toArray(function(err, bots) {
//     // do stuff here
//     db.close();
//   });
// });

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 5080;
var router = express.Router();

router.post('/dispatcher', function(req, res) {
  console.log(req.body.botName);
  res.json({ message: 'hooray! welcome to our api!' });
});

// REGISTER OUR ROUTES
app.use('/api', router);

// START THE SERVER
app.listen(port);
console.log('Server running on port ' + port);

// grand plan
// 1. Get bots working on server
// 2. refactor dispatcher to work outside of meteor
// 3. refactor DB to work outside of meteor
// 4.