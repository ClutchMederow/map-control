// to integrate with meteor app
global.IS_BOT_SERVER = true;

var _ = require('underscore');
var fs = require('fs');
var Future = require('fibers/future');
var Fiber = require('fibers');
var SteamBot = require('./app/SteamBot');
var DB = require('./app/db/DB');
var DispatcherConstructor = require('./app/dispatcher/Dispatcher');
var Mongo = require('mongo-sync');
var Server = Mongo.Server;
var addItemUtilityFunctions = require('./app/itemUtilityFunctions');

// Global
require('../../meteor/lib/config');
require('../../meteor/lib/Enums');

// Ignore Meteor check function
// TODO: Should port this over soon
global.check = function() {};
global.Match = { Where: function() {} };

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
  global.Tasks = MongoDB.getCollection('tasks');
  global.Listings = MongoDB.getCollection('listings');
  global.RealTimeTrade = MongoDB.getCollection('realTimeTrade');

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

router.post('/deposit', function(req, res) {
  Fiber(function() {
    try {
      var userId = req.body.userId;
      var items = req.body.items;

      var out = Dispatcher.depositItems(userId, items);

      res.json({ tradeofferId: out });
    } catch(e) {
      console.log(e);
      res.status(500).send(e.message);
      // throw e;
    }
  }).run();
});

router.post('/withdraw', function(req, res) {
  Fiber(function() {
    try {
      var userId = req.body.userId;
      var items = req.body.items;

      var out = Dispatcher.withdrawItems(userId, items);

      res.json({ tradeofferId: out });
    } catch(e) {
      console.log(e);
      res.status(500).send(e.message);
      // throw e;
    }
  }).run();
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
  Dispatcher.startPolling();
  var meat = Dispatcher.getBot('mc_steambot_1');
  meat.confirmMobile();
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


/// current problems:
// does not return an ID, return some kind of doc after update and insert....
// insert without specifying ID will insert using ObjectID, need to change this
// Moved DB to here, please cut dead code







