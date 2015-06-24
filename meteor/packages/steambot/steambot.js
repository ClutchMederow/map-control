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
};


SteamBot.prototype.logOn = function() {
  // NOTES
  // May want to reference some master list of steam servers in case we don't receive a valid one

  var self = this;
  var Steam = Npm.require('steam');
  var SteamTradeOffers = Npm.require('steam-tradeoffers');
  var Future = Npm.require('fibers/future')

  var admin = '76561197965124635'; // target

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

SteamBot.prototype.loadInventory = function() {
  var self = this;
  var Future = Npm.require('fibers/future');

  var future = new Future();

  self.offers.loadMyInventory(self.inventoryOptions, function(err, items) {
    if (err) throw err;

    future.return(items);
  });
  var items = future.wait();

  self.items.remove({});
  for (var i = 0; i < items.length; i++) {
    console.log(items[i]);
    self.items.insert(items[i]);
  }
};

SteamBot.prototype.takeItems = function(userSteamId, itemsToReceive) {
  if (typeof itemsToReceive === 'string')
    itemsToReceive = [itemsToReceive];

  check(arguments, {
    userSteamId: String,
    itemsToReceive: [String],
  });

  itemObjectArray = _.map(itemsToReceive, function(itemId) {
  });
}

SteamBot.prototype.test = function(steamAPI) {
  var test = new SteamBot('bungerblaster', 'igor1122', 'qrb6t', steamAPI);
  test.logOn();

  var item =  {
    appid: 730,
    contextid: 2,
    amount: 1,
    assetid: ''
  };

  // test.takeItems
  return test.loadInventory();
}

SteamBot.prototype._makeOffer = function(userSteamId, itemsToSend, itemsToReceive, callback) {

  if (typeof itemsToSend === 'object')
    itemsToSend = [itemsToSend];

  if (typeof itemsToReceive === 'object')
    itemsToReceive = [itemsToReceive];

  check(arguments, {
    userSteamId: String,
    itemsToSend: [Object],
    itemsToReceive: [Object],
  });
        // {
        //   appid: 730,
        //   contextid: 2,
        //   amount: 1,
        //   assetid: item.id
        // }

  self.offers.makeOffer ({
    partnerSteamId: userSteamId,
    itemsFromMe: itemsToSend,
    itemsFromThem: itemsToReceive,
    message: 'This is test'
  }, function(err, response){
    if (err) {
      throw err;
    }
    console.log(response);
  });
}


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
