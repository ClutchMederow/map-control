var fs = require("fs");
var Future = require('fibers/future');
var Fiber = require('fibers');
var Steam = require('steam');
var SteamStore = require('steamstore');
var User = require('steam-user');
var SteamTotp = require('steam-totp');

SteamBot = function(bot) {
  var userOptions = {
    promptSteamGuardCode: false,
    singleSentryfile: true,
    dataDirectory: '../../meteor/private',
  };

  this.client = new Steam.SteamClient();
  this.user = new User(this.client, userOptions);
  this.store = new SteamStore();
  this.botName = bot.name;
  this.password = bot.password;
  this.sharedSecret = bot.twoFactor.shared_secret;
};

SteamBot.prototype.logOn = function() {
  var self = this;
  var future = new Future();
  console.log('Logging in');

  var tokenPath = '../../meteor/private/sentry.bin';
  // var tokenPath = '../../meteor/private/steambot-auth/' + self.botName;
  var sentry = fs.readFileSync(tokenPath);
  this.user.setSentry(sentry);

  var logOnOptions = {
      accountName: self.botName,
      password: self.password,
      // authCode: self.bot.authCode,
  };

  this.user.logOn(logOnOptions);

  this.user.on('steamGuard', function(domain, cb, lastCodeWrong) {
    console.log('steamguard');
    if (lastCodeWrong && !future.isResolved()) {
      future.throw(new Error('Bad steamguard code'));
    }

    var code = self.generateAuthCode();
    cb(code);
  });

  this.user.on('error', function() {
    console.log('error');
    console.log(arguments);
  });

  this.user.on('loggedOn', function() {
    console.log(arguments);
  });

  this.user.on('webSession', function(sessionId, cookies) {
    console.log('webSession');
    self.store.setCookies(cookies);
    if (!future.isResolved()) {
      future.return();
    }
  });

  future.wait();
};

SteamBot.prototype.generateAuthCode = function() {
  if (!this.sharedSecret) {
    throw new Error('No shared secret present');
  }
  return SteamTotp.generateAuthCode(this.sharedSecret);
};

SteamBot.prototype.setupPhone = function() {
  var phone = '+19524512592';

  var future = new Future();

  this.store.addPhoneNumber(phone, function(err) {
    if (err) {
      console.log(err);
      future.throw();
    } else {
      console.log('Phone verification sent');
      future.return();
    }
  });

  future.wait();
};

SteamBot.prototype.confirmPhone = function(code) {
  var future = new Future();

  this.store.verifyPhoneNumber(code, function(err) {
    if (err) {
      console.log(err);
      future.throw();
    } else {
      console.log('Number successfully added!');
      future.return();
    }
  });

  return future.wait();
};

SteamBot.prototype.enableTwoFactor = function() {
  var future = new Future();

  this.user.enableTwoFactor(function(res) {
    console.log(res);
    future.return(res);
  });

  this.user.once('error', function(err) {
    console.log(err);
    if (!future.isResolved()) {
      future.throw(err);
    }
  });

  var result = future.wait();
  console.log('Two factor phone verification sent');
  return result;
};

SteamBot.prototype.finalizeTwoFactor = function(code, shared_secret) {
  var self = this;
  var future = new Future();

  console.log('Finalizing...');

  self.user.finalizeTwoFactor(shared_secret, code, function(res) {
    console.log(res);
    future.return(res);
  });

  self.user.once('error', function(err) {
    console.log(err);
    if (!future.isResolved()) {
      future.throw();
    }
  });

  future.wait();
  console.log('Successfully finalized two factor');
};

SteamBot.prototype.hasPhone = function() {
  var future = new Future();
  this.store.hasPhone(function(err, hasPhone, lastFour) {
    if (err) {
      future.throw(err);
    } else {
      future.return(hasPhone);
    }
  });

  return future.wait();
};

module.exports = SteamBot;