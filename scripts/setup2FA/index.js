var fs = require("fs");
var readlineSync = require('readline-sync');
var Future = require('fibers/future');
var Fiber = require('fibers');
var SteamBot = require('./SteamBot');

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');

var url = 'mongodb://localhost:3001/meteor';
MongoClient.connect(url, function(err, db) {
  var Bots = db.collection('bots');
  Bots.find().toArray(function(err, bots) {
    doBots(bots);
    db.close();
  });
});


function doBots(bots) {
  Fiber(function() {
    // var botPath = '../../meteor/private/bots.json';
    // var bots = JSON.parse(fs.readFileSync(botPath, 'utf8')).bots;

    // bots.forEach(function(bot) {
    var bot = new SteamBot(bots[9]);
    setUpBot(bot);
    // });

    console.log('complete!');
  }).run();
}

function setUpBot(bot) {
  Fiber(function() {

    // Log on
    bot.logOn();

    // Add phone
    // addPhone(bot);

    // Enable two factor
    // enableTwoFactor(bot);

    // Enter 2FA code
    // confirm2Fa(bot);

    // db.close();
    process.exit();
  }).run();
}

function addPhone(bot) {
  if (!bot.hasPhone()) {
    bot.setupPhone();

    var phoneCode = readlineSync.question('Enter phone code:');

    console.log('Setting up phone with code: ' + phoneCode);
    bot.confirmPhone(phoneCode)
  } else {
    console.log('Phone already added');
  }
}

function enableTwoFactor(bot) {

  console.log('Enabling two factor');
  var twoFaResult = bot.enableTwoFactor();

  console.log('saving 2FA data');

  var id = Mongo.ObjectId().toString();
  var doc = { name: bot.botName, twoFactor: twoFaResult };
  console.log(doc);
}

function confirm2Fa(bot) {
  var shared_secret = readlineSync.question('Enter shared secret:');

  var code = readlineSync.question('Enter 2FA auth code:');
  bot.finalizeTwoFactor(code, shared_secret);
}
