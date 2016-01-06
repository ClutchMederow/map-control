var fs = require("fs");
var Future = require('fibers/future');
var Fiber = require('fibers');
var SteamBot = require('./app/SteamBot');
var Server = require('mongo-sync').Server;

var db;
var Bots;

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
  var future = new Future();

  Fiber(function() {
    var botName = req.body.botName;
    getBots(future, botName);
    var bot = future.wait();
    var steamBot = new SteamBot(bot);
    steamBot.logOn();
    steamBot.tradeOffersLogOn();
    steamBot.loadBotInventory();
    console.log(steamBot.getBotItems());
    res.json({ bot: bot });
  }).run();
});

// REGISTER OUR ROUTES
app.use('/api', router);

// START THE SERVER
app.listen(port);
console.log('Server running on port ' + port);

// grand plan
// 1. Get bots working on server - should probably use mostly the 2fa login code and some original code
// 2. refactor dispatcher to work outside of meteor
// 3. refactor DB to work outside of meteor or else rpc call for it
// 4.

function getBots(future, botName) {
  var bot = Bots.findOne({ name: botName });
  future.return(bot);
}

Fiber(function() {
  db = new Server('localhost:3001').db('meteor');
  Bots = db.getCollection('bots');
}).run();