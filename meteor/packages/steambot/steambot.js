SteamBot = function(accountName, password, authCode) {
  // TODO: verify inputs
  var Steam = Npm.require('steam');
  var SteamTradeOffers = Npm.require('steam-tradeoffers');

  this.steam = new Steam.SteamClient();
  this.offers = new SteamTradeOffers();
  this.sessionID = '';
  this.logOnOptions = {
    accountName: accountName,
    password: password
  };
  this.authCode = authCode;
  this.items = new Meteor.Collection(null);
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

SteamBot.prototype.getItems = function() {
  return this.items.find().fetch();
};



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
