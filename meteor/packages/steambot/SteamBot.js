SteamBot = function(accountName, password, authCode, SteamAPI) {
  // TODO: verify inputs
  var Steam = Npm.require('steam');
  var SteamTradeOffers = Npm.require('steam-tradeoffers');

  this.logOnOptions = {
    accountName: accountName,
    password: password
  };
  this.authCode = authCode;
  this.SteamAPI = SteamAPI;

  this.steam = new Steam.SteamClient();
  this.offers = new SteamTradeOffers();
  this.sessionID = '';
  this.items = new Meteor.Collection(null);
  this.inventoryOptions = {
    appId: 730,
    contextId: 2
  };
  this.queue = [];
  this.busy = false;

  this.logOn();
  this.loadBotInventory();
};

SteamBot.prototype.logOn = function() {

  // NOTES
  // May want to reference some master list of steam servers in case we don't receive a valid one

  var self = this;
  var Steam = Npm.require('steam');
  var SteamTradeOffers = Npm.require('steam-tradeoffers');
  var Future = Npm.require('fibers/future')

  if (self.steam.connected)
    return;

  var baseDir = process.cwd().split('meteor')[0];
  var tokenPath = baseDir + 'steambot-auth/' + self.logOnOptions.accountName;

  if (Npm.require('fs').existsSync(tokenPath)) {
    self.logOnOptions['shaSentryfile'] = Npm.require('fs').readFileSync(tokenPath);
  } else if (self.authCode != '') {
    self.logOnOptions['authCode'] = self.authCode;
  }

  self.steam.logOn(self.logOnOptions);
  self.steam.on('debug', console.log);

  var logOnFuture = new Future();
  var logOnResolver = logOnFuture.resolver();

  self.steam.on('loggedOn', function(result) {
    console.log('Logged in!');
    self.steam.setPersonaState(Steam.EPersonaState.Online);

    // We need to avoid resolving this future more than once if we get disconnected and reconnect
    if (!logOnFuture.isResolved())
      logOnResolver(result);
  });

  var sessionFuture = new Future();
  var sessionResolver = sessionFuture.resolver();

  self.steam.on('webSessionID', function(sessionID) {
    self.sessionID = sessionID;
    self.steam.webLogOn(function(newCookie){
      self.offers.setup({
        sessionID: sessionID,
        webCookie: newCookie
      }, function(err) {
        if (err) {
          throw err;
        }
        self.cookie = newCookie;

        // We need to avoid resolving this future more than once if we get disconnected and reconnect
        if (!sessionFuture.isResolved())
          sessionResolver(newCookie);
      });
    });
  });

  // Save the token
  self.steam.on('sentry', function(data) {
    Npm.require('fs').writeFileSync(tokenPath, data);
  });

  Future.wait([logOnFuture, sessionFuture]);
};

SteamBot.prototype.getBotItems = function() {
  return this.items.find();
};

SteamBot.prototype.loadBotInventory = function() {
  var self = this;
  var Future = Npm.require('fibers/future');

  var future = new Future();

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
      assetid: foundItem.id
    };
  });

  return out;
};

SteamBot.prototype.takeItems = function(userSteamId, itemsToReceive) {
  // if (typeof itemsToReceive === 'string')
  //   itemsToReceive = [itemsToReceive];
  return this._makeOffer(userSteamId, [], itemsToReceive);
};

SteamBot.prototype.giveItems = function(userSteamId, itemsToGive) {
  // if (typeof itemsToReceive === 'string')
  //   itemsToReceive = [itemsToReceive];
  return this._makeOffer(userSteamId, itemsToGive, []);
};

// items should be in the format [{ classId: <classid>, instanceId: <instanceid> }]
SteamBot.prototype._makeOffer = function(userSteamId, itemObjsToSend, itemObjsToReceive) {

  // if (typeof itemsToSend === 'object')
  //   itemsToSend = [itemsToSend];

  // if (typeof itemsToReceive === 'object')
  //   itemsToReceive = [itemsToReceive];

  // var args = Array.prototype.slice.call(arguments);

  // check(args, {
  //   userSteamId: String,
  //   itemsToSend: Match.Optional([Object]),
  //   itemsToReceive: Match.Optional([Object]),
  // });

  var Future = require('fibers/future');
  var future = new Future();

  // TODO: Add some transaction id in message
  this.offers.makeOffer({
    partnerSteamId: userSteamId,
    itemsFromMe: itemObjsToSend,
    itemsFromThem: itemObjsToReceive,
    message: 'This is test'
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

SteamBot.prototype.queryOffer = function(offerId) {
  var options = {
    get_received_offers: 1,
    active_only: 1,
    // time_historical_cutoff: (new Date().getTime()/1000).toFixed()
  };
  var Future = Npm.require('fibers/future');
  var future = new Future();
  this.offers.getOffers(options, function(error,result) {
    if (error)
      future.throw(error);
    else
      future.return(result);
  });

  var res = future.wait();
  console.log(res.response.trade_offers_received);
};

SteamBot.prototype.getSteamId = function() {
  if (this.steam.loggedOn)
    return this.steam.steamID;
};

SteamBot.prototype.enqueue = function(queuedFunction) {
  this.queue.push(queuedFunction);
  this.executeNext();
};

// This allows us to execute the queued item right away if there are no other items in queue
// Otherwise, it recursively calls itself every time it is done to check for
SteamBot.prototype.executeNext = function () {
  var self = this;

  if (!this.busy && this.queue.length > 0) {

    // We are now busy, grab the next function
    this.busy = true;
    var nextFunc = this.queue.shift();

    // Wrap the function so we can be sure to set this to free when done
    function wrappedQueuedFunction() {

      // Execute the next function
      nextFunc();

      // Call executenext again when done
      self.busy = false;
      self.executeNext();
    }

    // We don't want to block here
    Meteor.setTimeout(wrappedQueuedFunction, 7000);
  }
}

SteamBot.prototype.test = function(pw, SteamAPI) {
  try {
    bot = new SteamBot('meatsting', pw, 'KJ8RH', SteamAPI);
  } catch(e) {
    console.log(e);
  }
};

// SteamBot.prototype.getOffers = function() {
//   var options = {
//     get_received_offers: 1,
//     active_only: 1,
//     // time_historical_cutoff: (new Date().getTime()/1000).toFixed()
//   };

//   this.offers.getOffers(options, function(error,result) {
//     console.log(result.response.trade_offers_received);
//   });
// };
