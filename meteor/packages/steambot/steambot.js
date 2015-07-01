var testId = '76561197965124635'; // target

var tradeOfferUrl = 'https://steamcommunity.com/tradeoffer/new/?partner=181099894&token=3WGBlP0T'

SteamBot = function(accountName, password, authCode, SteamAPI) {
  // TODO: verify inputs
  var Steam = Npm.require('steam');
  var SteamTradeOffers = Npm.require('steam-tradeoffers');

  // params
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
  }

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

  var admin = testId;

  var baseDir = process.cwd().split('.meteor')[0];
  var tokenPath = baseDir + 'private/steambot-auth/sentry';

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

SteamBot.prototype._getItemObjsWithIds = function(partnerSteamId, items) {
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

    if(foundItemArray.length !== 1)
      throw new Error('Bad item match: Should get 1, got ' + foundItemArray.length)

    return {
      appid: 730,
      contextid: 2,
      amount: 1,
      assetid: foundItemArray[0].id
    };
  });
};

SteamBot.prototype._getOwnedItemObjsWithIds = function(items) {
  var self = this;

  if (!items)
    return [];

  this.loadBotInventory();
  var foundItem;

  var out = _.map(items, function(itemToFind) {
    foundItem = self.items.findOne({ classid: itemToFind.classId, instanceId: itemToFind.instanceId });

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

SteamBot.prototype.test = function(steamAPI, pw) {
  var test = new SteamBot('bungerblaster', pw, 'qrb6t', steamAPI);

  // var out = test.takeItems('76561197965124635', [{ classId: '1046175032', instanceId: '188530139' }]);
  var out = test.giveItems('76561197965124635', [{ classId: '1046175032', instanceId: '188530139' }]);
  console.log(out);

  test.loadBotInventory();
  console.log(test.items.find().fetch());

  // var userSteamId = '76561197965124635';

};


// items should be in the format [{ classId: <classid>, instanceId: <instanceid> }]
SteamBot.prototype._makeOffer = function(userSteamId, itemsToSend, itemsToReceive) {

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

  var itemObjsToSend = this._getOwnedItemObjsWithIds(itemsToSend);
  var itemObjsToReceive = this._getItemObjWithIds(userSteamId, itemsToReceive);

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
}



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

        // offers.loadMyInventory({
        //   appId: 730,
        //   contextId: 2
        // }, function(err, items) {
        //   console.log(items);
        //   var item;
        //   // picking first tradable item
        //   for (var i = 0; i < items.length; i++) {
        //     if (items[i].tradable) {
        //       item = items[i];
        //       break;
        //     }
        //   }
        //   // if there is such an item, making an offer with it
        //   if (item) {
        //     offers.makeOffer ({
        //       partnerSteamId: admin,
        //       itemsFromMe: [
        //         {
        //           appid: 730,
        //           contextid: 2,
        //           amount: 1,
        //           assetid: item.id
        //         }
        //       ],
        //       itemsFromThem: [],
        //       message: 'This is test'
        //     }, function(err, response){
        //       if (err) {
        //         throw err;
        //       }
        //       console.log(response);
        //     });
        //   }
        // });
