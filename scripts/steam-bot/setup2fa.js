var fs = require('fs');
var readlineSync = require('readline-sync');
var Future = require('fibers/future');
var Fiber = require('fibers');
var SteamBot = require('./app/SteamBot');

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');

var url = 'mongodb://localhost:3001/meteor';
MongoClient.connect(url, function(err, db) {
  var botName = readlineSync.question('Enter bot name:');

  var Bots = db.collection('bots');
  Bots.findOne({ name: botName }, function(err, bot) {
    doBots(bot);
    db.close();
  });
});


function doBots(botData) {
  Fiber(function() {
    var bot = new SteamBot(botData);
    setUpBot(bot);

    console.log('complete!');
  }).run();
}

function setUpBot(bot) {
  // Fiber(function() {

    // Log on
    bot.logOn();

    // bot.requestValidationEmail();

    // Add phone
    // addPhone(bot);

    // Enable two factor
    // enableTwoFactor(bot);

    // Enter 2FA code
    // confirm2Fa(bot);

    // db.close();
    // process.exit();
  // }).run();
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
