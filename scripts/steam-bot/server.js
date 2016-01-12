// to integrate with meteor app
global.IS_BOT_SERVER = true;

var _ = require('underscore');
var fs = require('fs');
var Future = require('fibers/future');
var Fiber = require('fibers');
var SteamBot = require('./app/SteamBot');
var DB = require('../../meteor/server/db/db.js');
var DispatcherConstructor = require('./app/Dispatcher');
var Mongo = require('mongo-sync');
var Server = Mongo.Server;
var addItemUtilityFunctions = require('./app/itemUtilityFunctions');
require('../../meteor/lib/config');
require('../../meteor/lib/Enums');

var MongoDB;
var Dispatcher;
var Collections = {};

function initializeCollections() {
  global.Bots = MongoDB.getCollection('bots');
  global.Users = MongoDB.getCollection('users');
  global.Meteor = {
    users: global.Users
  };
  global.Tradeoffers = MongoDB.getCollection('tradeoffers');
  global.Items = MongoDB.getCollection('items');

  // this is bad but I can't find a better way
  // mongo-sync doesn't expose the Cursor object
  Bots.find().__proto__.fetch = Bots.find().__proto__.toArray;
  addItemUtilityFunctions(Items);
}

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 5080;
var router = express.Router();

router.post('/test', function(req, res) {
  console.log(req.body);
  res.json({ hey: 'there', me: 'drew' });
});

router.post('/deposit', function(req, res) {
  Fiber(function() {
    try {
      console.log(req.body);
      var userId = req.body.userId;
      var items = req.body.items;

      var out = Dispatcher.depositItems(userId, items);

      res.json({ res: out });
    } catch(e) {
      console.log(e);
      res.status(500).send('Error');
      throw e;
    }
  }).run();
});

router.post('/test', function(req, res) {
  console.log(req.body);
  res.json({ hey: 'there', me: 'drew' });
});

// REGISTER OUR ROUTES
app.use('/dispatcher', router);

// START THE SERVER
app.listen(port);
console.log('Server running on port ' + port);

function getBots(future, botName) {
  var bot = Bots.findOne({ name: botName });
  future.return(bot);
}

Fiber(function() {
  MongoDB = new Server('localhost:3001').db('meteor');
  initializeCollections();
  Dispatcher = new DispatcherConstructor(SteamBot, DB, Collections);
  Dispatcher.init();
  // process.exit();
}).run();

  // var future = new Future();

  // Fiber(function() {
  //   var botName = req.body.botName;
  //   getBots(future, botName);
  //   var bot = future.wait();
  //   var steamBot = new SteamBot(bot);
  //   steamBot.logOn();
  //   steamBot.tradeOffersLogOn();
  //   steamBot.loadBotInventory();
  //   res.json({ bot: steamBot.items });
  // }).run();
