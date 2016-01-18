var fs = require("fs");
var Future = require('fibers/future');
var Fiber = require('fibers');
var Steam = require('steam');
var SteamStore = require('steamstore');
var User = require('steam-user');
var Offers = require('steam-tradeoffers');
var SteamTotp = require('steam-totp');
var getApiKey = require('steam-web-api-key');
var _ = require('underscore');
var moment = require('moment');
var SteamConstants = require('./constants/SteamConstants');
var Enums = require('./Enums');
var SteamCommunity = require('steamcommunity');

var SteamBot = function(bot) {
  var userOptions = {
    promptSteamGuardCode: false,
    singleSentryfile: true,
    dataDirectory: '../../meteor/private',
  };

  this.client = new Steam.SteamClient();
  this.user = new User(this.client, userOptions);
  this.community = new SteamCommunity();
  this.offers = new Offers();
  this.store = new SteamStore();

  this.client.on('debug', console.log);

  this.botName = bot.name;
  this.password = bot.password;
  this.sharedSecret = bot.twoFactor.shared_secret;
  this.identitySecret = bot.twoFactor.identity_secret;

  this.items = [];
  this.sessionId = '';
  this.inventoryOptions = {
    appId: 730,
    contextId: 2
  };
  this.queue = [];
  this.busy = false;
  this.outstandingOfferCount = 0;

  // Random date in the past
  this.itemsUpdatedTimestamp = new Date(1995, 11, 17);

  this.logOn();
};

SteamBot.prototype.logOn = function() {
  var self = this;
  var future = new Future();
  console.log(this.botName + ' logging in');

  // bots 1-5 have their own sentry, should fix this sometime
  var tokenPath = '../../meteor/private/steambot-auth/' + self.botName;
  if (!fs.existsSync(tokenPath)) {
    tokenPath = '../../meteor/private/sentry.bin';
  }

  var sentry = fs.readFileSync(tokenPath);
  this.user.setSentry(sentry);

  var logOnOptions = {
      accountName: self.botName,
      password: self.password,
      twoFactorCode: self.generateAuthCode(),
  };

  function steamGuardHandler(domain, cb, lastCodeWrong) {
    var self = this;

    console.log('steamguard');

    // only resolve if in this block
    if (!future.isResolved()) {
      if (lastCodeWrong) {
        future.throw(new Error('Bad steamguard code'));
      } else {
        future.throw('Need steamguard code. Check email.');
      }
    }
    // var code = // get the code here
    // cb(code);
  }

  function errorHandler(err) {
    console.log('error');
    console.log(arguments);

    if (err.eresult === 5) {
      console.log('invalid pw');
    }
  }

  function loggedOnHandler() {
    console.log('logged on');
    console.log(arguments);
  }

  function webSessionHandler(sessionId, cookies) {
    console.log('websession received');

    self.sessionId = sessionId;
    self.cookies = cookies;

    self.store.setCookies(cookies);
    self.community.setCookies(cookies);

    if (!future.isResolved()) {
      future.return();
    }
  }

  this.user.on('steamGuard', steamGuardHandler);
  this.user.on('error', errorHandler);
  this.user.on('loggedOn', loggedOnHandler);
  this.user.on('webSession', webSessionHandler);

  this.user.logOn(logOnOptions);

  future.wait();

  self.setupTradeOffers();
};

SteamBot.prototype.setupTradeOffers = function() {
  var self = this;

  if (!self.cookies || !self.sessionId) {
    throw new Error('No sessionId or cookies');
  }

  this.offers.setup({
    sessionID: self.sessionId,
    webCookie: self.cookies,
    APIKey: self.getApiKey()
  });

  console.log('Tradeoffers initialized');
};

SteamBot.prototype.requestValidationEmail = function() {
  var future = new Future();
  console.log('Sending validation email');

  this.user.requestValidationEmail(function() {
    console.log(arguments);
    future.return();
  });

  future.wait();
};

SteamBot.prototype.getApiKey = function(callback) {
  var self = this;

  if (this.apiKey) {
    return this.apiKey;
  } else {
    var future = new Future();

    console.log('Getting API key...')

    getApiKey({
      sessionID: self.sessionId,
      webCookie: self.cookies,
    }, function(err, key) {
      if (err) {
        future.throw(err);
      } else {
        future.return(key);
      }
    });

    this.apiKey = future.wait();
    console.log('API key retreived');

    return this.apiKey;
  }
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
      future.throw(err);
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

SteamBot.prototype.loadTradeToken = function() {
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
  return this.items;
};

// Reload the bot's inventory if if the cache is expired
SteamBot.prototype.getItemCount = function() {
  if (moment().diff(this.itemsUpdatedTimestamp, 'seconds') > Config.bots.maxInventoryCacheTime) {
    this.loadBotInventory();
  }
  return this.items.length;
};

SteamBot.prototype.getSteamId = function() {
  return this.community.steamID.accountid;
};

SteamBot.prototype.loadBotInventory = function() {
  try {
    var self = this;
    var future = new Future();

    console.log('Loading bot inventory...');

    self.offers.loadMyInventory(self.inventoryOptions, function(err, items) {
      if (err)
        future.throw(err);
      else
        future.return(items);
    });

    self.items = future.wait();
    self.itemsUpdatedTimestamp = new Date();

    console.log('Bot inventory loaded!');
  } catch (e) {
    console.log(e);
    console.log('Could not load bot inventory');
  }
};

SteamBot.prototype.checkIfProfilePrivate = function(partnerSteamId) {
  var options = {
    partnerSteamId: partnerSteamId,
    appId: 730,
    contextId: 2
  };

  var future = new Future();

  this.offers.loadPartnerInventory(options, function(err, res) {
    if (err)
      future.throw(err);
    else
      future.return(res);
  });

  try {
    future.wait();
  } catch(e) {
    throw new Error(Enums.MeteorError.PRIVATE_INVENTORY, 'Unable to load inventory. Your inventory is set to private.');
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
    if(itemToFind.instanceId != '0' && foundItemArray.length !== 1) {
      throw new Error('Bad item match: Should get 1, got ' + foundItemArray.length)
    }

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

  if (!items) {
    return [];
  }

  this.loadBotInventory();
  var foundItem;

  var out = _.map(items, function(itemToFind) {
    foundItem = _.findWhere(self.items, { classid: itemToFind.classId, instanceid: itemToFind.instanceId });

    if (!foundItem) {
      throw new Error('Item not found: ' + itemToFind.classId + '|' + itemToFind.instanceId);
    }

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
  var offerId = this._makeOffer(userSteamId, userToken, itemsToGive, [], message);
  this.confirmMobile();
  return offerId;
};

// items should be in the format [{ classId: <classid>, instanceId: <instanceid> }]
SteamBot.prototype._makeOffer = function(userSteamId, userToken, itemsToSend, itemsToReceive, message) {
  this.checkIfProfilePrivate(userSteamId);

  var itemObjsToReceive = wrapItemForBot(itemsToReceive);
  var itemObjsToSend = wrapItemForBot(itemsToSend);

  var future = new Future();

  var offerObj = {
    partnerSteamId: userSteamId,
    accessToken: userToken,
    itemsFromMe: itemObjsToSend,
    itemsFromThem: itemObjsToReceive,
    message: message
  };

  // TODO: Add some transaction id in message
  this.offers.makeOffer(offerObj, function(err, res){
    if (err) {
      future.throw(err);
    } else {
      future.return(res);
    }
  });

  // TODO: Add a callback to reload inventory on acceptance...?

  try {
    var offer = future.wait();
    return offer.tradeofferid;
  } catch(e) {
    if (e.message && e.message.indexOf(SteamConstants.steamApi.errors.maxOffersOut) > -1) {
      throw new Error(Enums.MeteorError.MAX_OFFERS_OUT);
    } else {
      throw e;
    }
  }
};

SteamBot.prototype.queryOffersReceived = function() {

  // By not passing a cutoff time, it only returns offers that have been updated since last check
  var options = {
    get_sent_offers: 0,
    get_received_offers: 1,
    active_only: 1,
    // time_historical_cutoff: 0
  };

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

  var future = new Future();
  this.offers.getOffers(options, function(error,result) {
    if (error)
      future.throw(error);
    else
      future.return(result);
  });

  var res = future.wait();

  // set the outstanding offer count
  var activeOffers = _.filter(res.response.trade_offers_sent, function(offer) {
    var state = SteamConstants.offerStatus[offer.trade_offer_state];
    return [
      'k_ETradeOfferStateActive',
      'k_ETradeOfferStateCountered',
      'k_ETradeOfferStateEmailPending'
    ].indexOf(state) > -1;
  });

  this.outstandingOfferCount = activeOffers ? activeOffers.length : 0;
  this.cancelOldOffers(activeOffers);

  return res.response.trade_offers_sent;
};

SteamBot.prototype.getNewItemIds = function(tradeId) {
  check(tradeId, String);

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

SteamBot.prototype.enqueue = function(queuedFunction, numTries) {
  var maxTries = 5;

  numTries = numTries || 0;
  numTries++;

  if (this.outstandingOfferCount < Config.bots.maxOutstandingOffersSent) {
    queuedFunction();
  } else if (numTries <= maxTries){
    sleep(Config.bots.maxOffersRetryInterval).wait()
    this.enqueue(queuedFunction);
  } else {
    // throw an error if we hit this condition
    queuedFunction(true);
  }
  // this.queue.push(queuedFunction);
  // this.executeNext();
};

SteamBot.prototype.cancelOldOffers = function(offers) {
  var nowUnix = Math.floor(Date.now() / 1000);
  var self = this;

  _.each(offers, function(offer) {
    if (SteamConstants.offerStatus[offer.trade_offer_state] === 'k_ETradeOfferStateActive' ||
      SteamConstants.offerStatus[offer.trade_offer_state] === 'k_ETradeOfferStateEmailPending') {

      if (nowUnix - offer.time_created > Config.bots.maxActiveOfferTime) {
        console.log(nowUnix - offer.time_created);
        self.cancelOffer(offer.tradeofferid);
      }

    } else if (SteamConstants.offerStatus[offer.trade_offer_state] === 'k_ETradeOfferStateCountered') {

      this.cancelOffer(offer.tradeofferid);
    }
  });
};

SteamBot.prototype.initializeTwoFactor = function() {
  var timeKey = Math.round(Date.now() / 1000);
  var identitySecret = this.identitySecret;
  var confKey = SteamTotp.getConfirmationKey(identitySecret, timeKey, 'conf');
  var allowKey = SteamTotp.getConfirmationKey(identitySecret, timeKey, 'allow');

  this.mobileConfirmCodes = {
    timeKey: timeKey,
    confKey: confKey,
    allowKey: allowKey,
  };
};

SteamBot.prototype.confirmMobile = function() {
  var future = new Future();

  if (!this.mobileConfirmCodes) {
    this.initializeTwoFactor();
  }

  var time = this.mobileConfirmCodes.timeKey;
  var confKey = this.mobileConfirmCodes.confKey;
  var allowKey = this.mobileConfirmCodes.allowKey;

  this.community.getConfirmations(time, confKey, function(err, res) {
    if (err) {
      future.throw(err);
    } else {
      future.return(res);
    }
  });

  var confirmations = future.wait();

  var errArray = [];
  _.each(confirmations, function(conf) {
    var err = confirmTrade(conf, time, allowKey);
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

function confirmTrade(confirmation, time, key) {
  var future = new Future();

  confirmation.respond(time, key, true, function(err) {
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

function sleep(ms) {
  var future = new Future;
  setTimeout(function() {
    future.return();
  }, ms);
  return future;
}

module.exports = SteamBot;