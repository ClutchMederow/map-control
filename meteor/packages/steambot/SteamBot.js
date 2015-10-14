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
  this.botName = accountName;

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
  // Random date in the past
  this.itemsUpdatedTimestamp = new Date(1995, 11, 17);

  this.steam.on('error', function(err) {
    console.log(err);
  });

  this.logOn();
};

SteamBot.prototype.logOn = function() {

  // NOTES
  // May want to reference some master list of steam servers in case we don't receive a valid one

  var self = this;
  var Steam = Npm.require('steam');
  var SteamTradeOffers = Npm.require('steam-tradeoffers');

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

  var Future = Npm.require('fibers/future');
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
          console.log(err);
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

  // logOnFuture.get();
  // sessionFuture.get();
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
  return this.steam.steamID;
};

SteamBot.prototype.loadBotInventory = function() {
  try {
    var self = this;

    var Future = Npm.require('fibers/future');
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

  var Future = Npm.require('fibers/future');
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

SteamBot.prototype.takeItems = function(userSteamId, itemsToReceive, message) {
  return this._makeOffer(userSteamId, [], itemsToReceive, message);
};

SteamBot.prototype.giveItems = function(userSteamId, itemsToGive, message) {
  return this._makeOffer(userSteamId, itemsToGive, [], message);
};

// items should be in the format [{ classId: <classid>, instanceId: <instanceid> }]
SteamBot.prototype._makeOffer = function(userSteamId, itemsToSend, itemsToReceive, message) {

  var itemObjsToReceive = wrapItemForBot(itemsToReceive);
  var itemObjsToSend = wrapItemForBot(itemsToSend);

  var Future = Npm.require('fibers/future');
  var future = new Future();

  // TODO: Add some transaction id in message
  this.offers.makeOffer({
    partnerSteamId: userSteamId,
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

  var Future = Npm.require('fibers/future');
  var future = new Future();
  this.offers.getOffers(options, function(error,result) {
    if (error)
      future.throw(error);
    else
      future.return(result);
  });

  var res = future.wait();
  return res.response.trade_offers_sent;
};

SteamBot.prototype.queryOffers = function() {

  // By not passing a cutoff time, it only returns offers that have been updated since last check
  var options = {
    get_sent_offers: 1,
    get_received_offers: 0,
    active_only: 1,
    // time_historical_cutoff: 0
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
  return res.response.trade_offers_sent;
};

SteamBot.prototype.getNewItemIds = function(tradeId) {
  check(tradeId, String);

  var Future = Npm.require('fibers/future');
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

SteamBot.prototype.getSingleOffer = function(offerId) {

};

SteamBot.prototype.acceptOffer = function(tradeofferId) {
  var Future = Npm.require('fibers/future');
  var future = new Future();

  this.offers.acceptOffer({
    tradeofferid: tradeofferId
  }, function(err, res) {
    if (err) {
      future.throw(err);
    } else {
      future.return(res);
    }
  });

  return future.wait();
};

SteamBot.prototype.getSteamId = function() {
  if (this.steam.loggedOn) {
    return this.steam.steamID;
  }
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