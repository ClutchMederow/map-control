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
var passport = require('passport');
var Strategy = require('passport-http').BasicStrategy;
var Settings = require('./private/localsettings.js');

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

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Authentication
passport.use(new Strategy(
  function(username, password, cb) {
    if (Settings.botServer.username === username && Settings.botServer.password === password) {
      return cb(null, true);
    }
    return cb(null, false);
  })
);

app.all('/*', passport.authenticate('basic', { session: false }), function(req, res, next) {
  next();
});

app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

var port = process.env.PORT || 5080;
var router = express.Router();

/// test
router.post('/test', function(req, res) {
  console.log(arguments);
  res.status(500).send('hello');
});

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

Fiber(function() {
  var url = Settings.botServer.mongoUrl;
  MongoDB = new Server(url).db('meteor');
  initializeCollections();
  Dispatcher = new DispatcherConstructor(SteamBot, DB, Collections);
  Dispatcher.init();
  Dispatcher.startPolling();
}).run();

function getBots(future, botName) {
  var bot = Bots.findOne({ name: botName });
  future.return(bot);
}

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
