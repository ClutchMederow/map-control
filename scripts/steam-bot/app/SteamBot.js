var fs = require("fs");
var Future = require('fibers/future');
var Fiber = require('fibers');
var Steam = require('steam');
var SteamStore = require('steamstore');
var User = require('steam-user');
var SteamTotp = require('steam-totp');
var SteamTradeOffers = require('steam-tradeoffers');

SteamBot = function(bot, SteamAPI) {
  this.Future = require('fibers/future');
  // TODO: verify inputs
  // var Steam = require('steam');
  // var SteamTradeOffers = require('steam-tradeoffers');
  // var SteamCommunity = require('steamcommunity');
  // var SteamStore = require('steamstore');

  // this.authCode = authCode;
  this.SteamAPI = SteamAPI;
  // this.botName = accountName;

  // this.steam = new Steam.SteamClient();
  // this.offers = new SteamTradeOffers();
  // this.community = new SteamCommunity();
  // this.store = new SteamStore();

  /* ------------ */
  var userOptions = {
    promptSteamGuardCode: false,
    singleSentryfile: true,
    dataDirectory: '../../meteor/private',
  };

  this.steam = new Steam.SteamClient();
  this.user = new User(this.steam, userOptions);
  this.store = new SteamStore();
  this.offers = new SteamTradeOffers();

  this.botName = bot.name;
  this.password = bot.password;
  this.sharedSecret = bot.twoFactor.shared_secret;

  /* ------------ */

  this.sessionID = '';
  this.items = new Meteor.Collection(null);
  this.inventoryOptions = {
    appId: 730,
    contextId: 2
  };
  this.queue = [];
  this.busy = false;
  // Random date in the past
  this.itemsUpdatedTimestamp = new Date(1995, 11, 17);
  this.outstandingOfferCount = 0;

  // this.initializeTwoFactor();

  // this.logOnOptions = {
  //   accountName: accountName,
  //   password: password,
  // };

  this.steam.on('error', function(err) {
    console.log(err);
    console.log(err.eresult);
  });

  this.user.on('error', function(err) {
    console.log(err);
    console.log(err.eresult);
  });

  // this.logOn();
  // this.communityLogOn();
  // this.tradeOffersLogOn();
  // this.webLogOn();
  // this.loadTradeToken();
};

SteamBot.prototype.logOn = function() {
  // NOTES
  // May want to reference some master list of steam servers in case we don't receive a valid one

  var self = this;
  var future = new Future();

  var baseDir = process.cwd().split('meteor')[0];
  var tokenPath = baseDir + 'meteor/private/sentry.bin';
  var sentry = fs.readFileSync(tokenPath);
  this.user.setSentry(sentry);

  var logOnOptions = {
    accountName: self.botName,
    password: self.password,
    two_factor_code: self.generateAuthCode(),
  };

  this.steam.connect = function() {
    this.logOn(logOnOptions);
  };

  console.log(this.botName + ' logging in...');
  this.user.logOn(logOnOptions);

  // Steamguard event
  this.user.on('steamGuard', function(domain, cb, lastCodeWrong) {
    console.log('steamguard');
    if (lastCodeWrong && !future.isResolved()) {
      future.throw(new Error('Bad steamguard code'));
    }

    var code = self.generateAuthCode();
    cb(code);

    /// ADD FUTURE HERE
  });

  this.user.on('error', function(err) {
    console.log(self.botName + ' logon error');
    future.throw(err);
  });

  // No need to include future here as webSession requires loggedOn
  this.user.on('loggedOn', function() {
    console.log(self.botName + ' logged in!');
  });

  // Get the webSession data to prime SteamStore
  this.user.on('webSession', function(sessionId, cookie) {
    console.log(self.botName + ' webSession received');

    self.sessionID = sessionID;
    self.cookie = cookie;

    self.store.setCookies(cookie);
    if (!future.isResolved()) {
      future.return();
    }
  });

  future.wait();

  // Remove listeners to avoid resolving a future twice
  // These are async but fuck it
  this.user.removeListener('steamGuard')
    .removeListener('error')
    .removeListener('loggedOn')
    .removeListener('webSession');
};

// SteamBot.prototype.logOn = function() {
//   // NOTES
//   // May want to reference some master list of steam servers in case we don't receive a valid one

//   var self = this;
//   var Steam = require('steam');
//   var SteamTradeOffers = require('steam-tradeoffers');

//   if (self.steam.connected) {
//     return;
//   }

//   // var tokenPath;

//   // if (Meteor.settings.environment === 'dev') {
//   //   var baseDir = process.cwd().split('meteor')[0];
//   //   tokenPath = baseDir + 'meteor/private/sentry.bin';
//   // } else {
//   //   tokenPath = 'assets/app/sentry.bin';
//   // }

//   // // use the sentry token if it exists
//   // if (require('fs').existsSync(tokenPath)) {
//   //   self.logOnOptions['shaSentryfile'] = require('fs').readFileSync(tokenPath);
//   // } else if (self.authCode != '') {
//   //   self.logOnOptions['authCode'] = self.authCode;
//   // }

//   // // use 2FA if set up
//   // if (this.twoFactorCodes && this.twoFactorCodes.key) {
//   //   self.logOnOptions.twoFactorCode = this.twoFactorCodes.key;
//   // }

//   var logOnOptions = {
//     accountName: self.botName,
//     password: self.password,
//     twoFactorCode: self.generateAuthCode(),
//   };

//   self.steam.logOn(logOnOptions);
//   self.steam.on('debug', console.log);

//   var Future = require('fibers/future');
//   var logOnFuture = new Future();
//   var logOnResolver = logOnFuture.resolver();

//   self.steam.once('loggedOn', function(result) {
//     console.log('Logged in!');
//     self.steam.setPersonaState(Steam.EPersonaState.Online);

//     // We need to avoid resolving this future more than once if we get disconnected and reconnect
//     if (!logOnFuture.isResolved())
//       logOnResolver(result);
//   });

//   var sessionFuture = new Future();
//   var sessionResolver = sessionFuture.resolver();

//   self.steam.once('webSessionID', function(sessionID) {
//     self.sessionID = sessionID;

//     // We need to avoid resolving this future more than once if we get disconnected and reconnect
//     if (!sessionFuture.isResolved()) {
//       sessionResolver();
//     }
//   });

//   // Save the token
//   self.steam.once('sentry', function(data) {
//     require('fs').writeFileSync(tokenPath, data);
//   });

//   Future.wait([logOnFuture, sessionFuture]);

//   // logOnFuture.get();
//   // sessionFuture.get();
// };

// SteamBot.prototype.webLogOn = function() {
// };

SteamBot.prototype.generateAuthCode = function() {
  if (!this.sharedSecret) {
    throw new Error('No shared secret present');
  }
  return SteamTotp.generateAuthCode(this.sharedSecret);
};

// SteamBot.prototype.webLogOn = function() {
//   var Future = require('fibers/future');
//   var future = new Future();
//   var self = this;

//   self.steam.webLogOn(function(newCookie){
//     self.cookie = newCookie;
//     self.community.setCookies(self.cookie);
//     self.store.setCookies(self.cookie);

//     self.offers.setup({
//       sessionID: self.sessionID,
//       webCookie: newCookie,
//     }, function(err) {
//       if (err) {
//         future.throw(err);
//       } else {
//         future.return();
//       }
//     });
//   });

//   future.wait();
// };

SteamBot.prototype.tradeOffersLogOn = function() {
  var self = this;
  var future = new this.Future();

  this.offers.setup({
    sessionID: self.sessionID,
    webCookie: self.cookie,
  }, function(err) {
    if (err) {
      future.throw(err);
    } else {
      future.return();
    }
  });

  future.wait();
};

SteamBot.prototype.loadTradeToken = function() {
  var Future = require('fibers/future');
  var future = new Future();
  var self = this;

  this.offers.getOfferToken(function(err, res) {
    if (err) {
      future.throw(err);
    } else {
      self.tradeToken = res;
      future.return();
    }
  });

  future.wait();
};

SteamBot.prototype.getBotItems = function() {
  return this.items.find().fetch();
};

// Reload the bot's inventory if if the cache is expired
SteamBot.prototype.getItemCount = function() {
  if (moment().diff(this.itemsUpdatedTimestamp, 'seconds') > Config.bots.maxInventoryCacheTime) {
    this.loadBotInventory();
  }
  return this.items.find().count();
};

SteamBot.prototype.getSteamId = function() {
  return this.community.steamID.accountid;
};

SteamBot.prototype.loadBotInventory = function() {
  try {
    var self = this;

    var Future = require('fibers/future');
    var future = new Future();

    console.log('Loading bot inventory...');

    self.offers.loadMyInventory(self.inventoryOptions, function(err, items) {
      if (err)
        future.throw(err);
      else
        future.return(items);
    });
    var items = future.wait();

    self.items.remove({});
    for (var i = 0; i < items.length; i++) {
      self.items.insert(items[i]);
    }

    self.itemsUpdatedTimestamp = new Date();

    console.log('Bot inventory loaded!');
  } catch (e) {
    console.log('Could not load bot inventory');
  }
};

SteamBot.prototype.getItemObjsWithIds = function(partnerSteamId, items) {
  if(!items)
    return [];

  var options = {
    partnerSteamId: partnerSteamId,
    appId: 730,
    contextId: 2
  };

  var Future = require('fibers/future');
  var future = new Future();

  this.offers.loadPartnerInventory(options, function(err, res) {
    if (err)
      future.throw(new Error(err));
    else
      future.return(res);
  });

  var userItems = future.wait();
  var foundItemArray;

  // Wrap each id in an object - should revisit 'amount' in the future
  return _.map(items, function(itemToFind) {

    foundItemArray = _.where(userItems, {
      classid: itemToFind.classId,
      instanceid: itemToFind.instanceId
    });

    // TODO: Coerce all ids to numbers
    if(itemToFind.instanceId != '0' && foundItemArray.length !== 1)
      throw new Error('Bad item match: Should get 1, got ' + foundItemArray.length)

    return {
      appid: 730,
      contextid: 2,
      amount: 1,
      assetid: foundItemArray[0].id
    };
  });
};

SteamBot.prototype.getOwnedItemObjsWithIds = function(items) {
  var self = this;

  if (!items)
    return [];

  this.loadBotInventory();
  var foundItem;

  var out = _.map(items, function(itemToFind) {
    foundItem = self.items.findOne({ classid: itemToFind.classId, instanceid: itemToFind.instanceId });

    if (!foundItem)
      throw new Error('Item not found: ' + itemToFind.classId + '|' + itemToFind.instanceId);

    return {
      appid: 730,
      contextid: 2,
      amount: 1,
      assetid: foundItem.id,
      _id: itemToFind._id
    };
  });

  return out;
};

SteamBot.prototype.takeItems = function(userSteamId, userToken, itemsToReceive, message) {
  return this._makeOffer(userSteamId, userToken, [], itemsToReceive, message);
};

SteamBot.prototype.giveItems = function(userSteamId, userToken, itemsToGive, message) {
  return this._makeOffer(userSteamId, userToken, itemsToGive, [], message);
};

// items should be in the format [{ classId: <classid>, instanceId: <instanceid> }]
SteamBot.prototype._makeOffer = function(userSteamId, userToken, itemsToSend, itemsToReceive, message) {

  var itemObjsToReceive = wrapItemForBot(itemsToReceive);
  var itemObjsToSend = wrapItemForBot(itemsToSend);

  var Future = require('fibers/future');
  var future = new Future();

  // TODO: Add some transaction id in message
  this.offers.makeOffer({
    partnerSteamId: userSteamId,
    accessToken: userToken,
    itemsFromMe: itemObjsToSend,
    itemsFromThem: itemObjsToReceive,
    message: message
  }, function(err, res){
    if (err)
      future.throw(err);
    else
      future.return(res);
  });

  // TODO: Add a callback to reload inventory on acceptance...?

  var offer = future.wait();
  return offer.tradeofferid;
};

SteamBot.prototype.queryOffersReceived = function() {

  // By not passing a cutoff time, it only returns offers that have been updated since last check
  var options = {
    get_sent_offers: 0,
    get_received_offers: 1,
    active_only: 1,
    // time_historical_cutoff: 0
  };

  var Future = require('fibers/future');
  var future = new Future();
  this.offers.getOffers(options, function(error,result) {
    if (error)
      future.throw(error);
    else
      future.return(result);
  });

  var res = future.wait();
  return res.response.trade_offers_received;
};

SteamBot.prototype.queryOffers = function() {

  // By not passing a cutoff time, it only returns offers that have been updated since last check
  var options = {
    get_sent_offers: 1,
    get_received_offers: 0,
    active_only: 1,
    // time_historical_cutoff: 0
  };

  var Future = require('fibers/future');
  var future = new Future();
  this.offers.getOffers(options, function(error,result) {
    if (error)
      future.throw(error);
    else
      future.return(result);
  });

  var res = future.wait();

  // set the outstanding offer count
  var activeOffers = _.where(res.response.trade_offers_sent, function(offer) {
    return [
      'k_ETradeOfferStateActive',
      'k_ETradeOfferStateCountered',
      'k_ETradeOfferStateEmailPending'
    ].indexOf(SteamConstants.offerStatus[offer.trade_offer_state]) > -1;
  });
  this.outstandingOfferCount = activeOffers ? activeOffers.length : 0;

  return res.response.trade_offers_sent;
};

SteamBot.prototype.getNewItemIds = function(tradeId) {
  check(tradeId, String);

  var Future = require('fibers/future');
  var future = new Future();

  this.offers.getItems({ tradeId: tradeId }, function(err, res) {
    if (err) {
      future.throw(err);
    } else {
      future.return(res);
    }
  });

  return future.wait();
};

SteamBot.prototype.loggedOn = function() {
  // return !!this.;
};

SteamBot.prototype.getSingleOffer = function(offerId) {
  var Future = require('fibers/future');
  var future = new Future();

  var options = {
    tradeofferid: offerId
  };

  this.offers.getOffer(options, function(err, res) {
    if (err) {
      future.throw(err);
    } else {
      future.return(res);
    }
  });

  var out = future.wait();
  return out.response.offer;
};

SteamBot.prototype.cancelOffer = function(tradeofferId) {
  var Future = require('fibers/future');
  var future = new Future();

  this.offers.cancelOffer({
    tradeOfferId: tradeofferId
  }, function(err, res) {
    if (err) {
      future.throw(err);
    } else {
      future.return(res);
    }
  });

  return future.wait();
};

SteamBot.prototype.acceptOffer = function(tradeofferId) {
  var Future = require('fibers/future');
  var future = new Future();

  this.offers.acceptOffer({
    tradeOfferId: tradeofferId
  }, function(err, res) {
    if (err) {
      future.throw(err);
    } else {
      future.return(res);
    }
  });

  return future.wait();
};

SteamBot.prototype.enqueue = function(queuedFunction) {
  this.queue.push(queuedFunction);
  this.executeNext();
};

// This allows us to execute the queued item right away if there are no other items in queue
// Otherwise, it recursively calls itself every time it is done to check for
SteamBot.prototype.executeNext = function () {
  var self = this;

  if (this.outstandingOfferCount < Config.bots.maxOutstandingOffersSent) {

    if (this.queue.length === 0) {
      return;
    }

    // We are now busy, grab the next function
    var nextFunc = this.queue.shift();

    // Wrap the function so we can be sure to set this to free when done
    function wrappedQueuedFunction() {

      // Execute the next function
      nextFunc();

      // Call executenext again when done
      self.executeNext();
    }

    // We don't want to block here
    Meteor.setTimeout(wrappedQueuedFunction, 0);
  } else {

    // if queue length is not zero, this will kick off the dequeuing process
    // hopefully the outstandingOfferCount will be lower next time
    Meteor.setTimeout(executeNext, Config.bots.maxOffersRetryInterval);
  }
};

SteamBot.prototype.cancelOldOffers = function(offers) {
  var nowUnix = Math.floor(Date.now() / 1000);

  _.each(offers, function(offer) {
    if (SteamConstants.offerStatus[offer.trade_offer_state] === 'k_ETradeOfferStateActive' ||
      SteamConstants.offerStatus[offer.trade_offer_state] === 'k_ETradeOfferStateEmailPending') {

      if (nowUnix - offer.time_created > Config.bots.maxActiveOfferTime) {
        this.cancelOffer(offer.tradeofferid);
      }

    } else if (SteamConstants.offerStatus[offer.trade_offer_state] === 'k_ETradeOfferStateCountered') {

      this.cancelOffer(offer.tradeofferid);
    }
  });
};

// SteamBot.prototype.setupPhone = function() {
//   var phone = '+19524512592';

//   var future = new this.Future();

//   this.store.addPhoneNumber(phone, function(err) {
//     if (err) {
//       console.log(err);
//       future.throw();
//     } else {
//       console.log('Phone verification sent');
//       future.return();
//     }
//   });

//   future.wait();
// };

// SteamBot.prototype.confirmPhone = function(code) {
//   var future = new this.Future();

//   this.store.verifyPhoneNumber(code, function(err) {
//     if (err) {
//       console.log(err);
//       future.throw();
//     } else {
//       console.log('Number successfully added!');
//       future.return();
//     }
//   });

//   return future.wait();
// };

// SteamBot.prototype.enableTwoFactor = function() {
//   var future = new this.Future();

//   this.community.enableTwoFactor(function(err, res) {
//     if (err) {
//       future.throw(err);
//     } else {
//       future.return(res);
//     }
//   });

//   var result = future.wait();
//   Bots.upsert({ name: this.botName }, { $set: { twoFactor: result } });
//   console.log('Two factor phone verification sent');
// };

// SteamBot.prototype.finalizeTwoFactor = function(code) {
//   var future = new this.Future();

//   var bot = Bots.findOne({ name: this.botName });
//   this.community.finalizeTwoFactor(bot.twoFactor.shared_secret, code, function(err) {
//     if (err) {
//       future.throw(err);
//     } else {
//       future.return();
//     }
//   });

//   future.wait();
//   console.log('Successfully finalized two factor');
// };

// SteamBot.prototype.initializeTwoFactor = function() {
//   var SteamTotp = require('steam-totp');

//   var bot = Bots.findOne({ name: this.botName });
//   if (!bot) {
//     console.log('Two factor not yet set up');
//     return;
//     // throw new Error('No bot found in collection');
//   }

//   var timekey = Math.round(Date.now() / 1000);
//   var sharedSecret = bot.twoFactor.shared_secret.toString('base64');
//   var code = SteamTotp.generateAuthCode(sharedSecret);

//   this.twoFactorCodes = {
//     timekey: timekey,
//     sharedSecret: sharedSecret,
//     key: code,
//   };

//   console.log(sharedSecret);
//   console.log(code);
// };

SteamBot.prototype.confirmMobile = function() {
  var future = new this.Future();
  this.community.getConfirmations(this.twoFactorCodes.timekey, key, function(err, res) {
    if (err) {
      future.throw(err);
    } else {
      future.return(res);
    }
  });

  var confirmations = future.wait();

  var time = this.twoFactorCodes.timekey;
  var key = this.twoFactorCodes.key;
  var errArray = [];

  _.each(confirmations, function(conf) {
    var err = confirmTrade(conf, time, key);
    if (err) {
      errArray.push(err);
    }
  });

  // throw if any errored, but wait until after all are done
  if (errArray.length) {
    throw new Error(errArray[0].toString(), errArray);
  }
};

SteamBot.prototype.alignTime = function() {
  var myTime = Math.round(Date.now() / 1000);
  var theirTime = HTTP.post('https://api.steampowered.com/ITwoFactorService/QueryTime/v0001', { data: { steamid: '0' } }).data.response.server_time;

  var diff = myTime - theirTime;
  return diff;
};

// SteamBot.addExternalCode = function(accountName) {
//   var fs = require('fs');
//   var baseDir = process.cwd().split('meteor')[0];
//   var filename = baseDir + 'scripts/setup2FA/' + accountName + '.2fa';

//   var data = JSON.parse(fs.readFileSync(filename, 'utf8'));
//   Bots.upsert({ name: accountName }, { $set: { twoFactor: data } });
// };

SteamBot.prototype.communityLogOn = function() {
  var self = this;

  // use 2FA if set up
  if (this.twoFactorCodes && this.twoFactorCodes.key) {
    self.logOnOptions.twoFactorCode = this.twoFactorCodes.key;
  }

  var future = new this.Future();

  this.community.login(self.logOnOptions, function(err, sessionID, cookies, steamguard) {
    if (err) {
      future.throw(err);
    } else {
      var result = {
        sessionID: sessionID,
        cookie: cookies,
        steamguard: steamguard,
      };

      future.return(result);
    }
  });

  var res = future.wait();

  console.log(res);

  this.cookie = res.cookie;
  this.sessionID = res.sessionID;
};

function confirmTrade(confirmation, time, key) {
  var Future = require('fibers/future');
  var future = new this.Future();

  confirmation.respond(time, key, function(err) {
    if (err) {
      future.throw(err);
    } else {
      future.return();
    }
  });

  try {
    future.wait()
  } catch(e) {
    return e;
  }
}

function wrapItemForBot(itemIds) {
  return _.map(itemIds, function(item) {
    return {
      appid: 730,
      contextid: 2,
      amount: 1,
      assetid: item
    };
  });
}