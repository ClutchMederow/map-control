var Future = Npm.require('fibers/future');

BotJob = function(bot, jobType, taskId, options, DBLayer) {

  if (!(bot instanceof SteamBot))
    throw new Error('INVALID_BOT');

  if (options.items.length < 1)
    throw new Error('NO_ITEMS');

  check(taskId, String);
  check(DBLayer, Object);

  // private fields
  this._taskId = taskId;
  this._bot = bot;

  // We pass in DB here for easy mocking during tests
  this._DB = DBLayer;

  // Fields to be stringified
  this.jobType = jobType;
  this.jobId = Random.id();

  // Set up the object depending on job type
  if (jobType === Dispatcher.jobType.DEPOSIT_ITEMS) {

    check(options, {
      items: [String],
      userId: String
    });

    this.userId = options.userId;
    this.items = options.items;

  } else if (jobType === Dispatcher.jobType.WITHDRAW_ITEMS) {

    check(options, {
      items: [String],
      userId: String
    });

    this.userId = options.userId;
    this.items = options.items;

  } else if (jobType === Dispatcher.jobType.INTERNAL_TRANSFER) {

    check(options, {
      items: [String],
      otherBot: SteamBot
    });

    this.items = options.items;
    this._otherBot = options.otherBot;
    this.otherBotName = options.otherBot.botName;

  } else if (jobType === Dispatcher.jobType.ACCEPT_OFFER) {

    check(options, {
      tradeofferId: String,
    });

    this.tradeofferId = options.tradeofferId;
  }

  this._setStatus(Dispatcher.jobStatus.READY);
};

BotJob.prototype._executeDeposit = function() {
  var self = this;

  // Find item assetIds
  // var itemsWithAssetIds = self._bot.getItemObjsWithIds(self.steamId, self._itemDocuments);
  var steamId = Meteor.users.findOne(this.userId).services.steam.id;

  var id = Random.id();
  var message = 'Deposit ID: ' + id;

  // Make the tradeoffer
  self.tradeofferId = self._bot.takeItems(steamId, self.items, message);

  // Save the tradeoffer
  self._DB.tradeoffers.insertNew(id, self.tradeofferId, self.userId, self.jobType, self._bot.botName, self._taskId);

  // Add the items
  self._DB.items.insertNewItems(self.userId, self.tradeofferId, self.items, self._bot.botName);

  return this.tradeofferId;
};

BotJob.prototype._executeWithdrawal = function() {
  var self = this;

  // Find item assetIds
  // var itemsWithAssetIds = self._bot.getItemObjsWithIds(self.steamId, self._itemDocuments);
  var steamId = Meteor.users.findOne(this.userId).services.steam.id;

  var id = Random.id();
  var message = 'Withdrawl ID: ' + id;

  // Make the tradeoffer
  self.tradeofferId = self._bot.giveItems(steamId, self.items, message);

  // Save the tradeoffer
  self._DB.tradeoffers.insertNew(id, self.tradeofferId, self.userId, self.jobType, self._bot.botName, self._taskId);

  return this.tradeofferId;
};

BotJob.prototype._executeInternalTransfer = function() {
  var self = this;

  var steamId = this._otherBot.getSteamId();
  var id = Random.id();
  var message = 'Transfer ID: ' + id;

  // Make the tradeoffer
  self.tradeofferId = self._bot.takeItems(steamId, self.items, message);

  // Save the tradeoffer
  self._DB.tradeoffers.insertNew(id, self.tradeofferId, self.userId, self.jobType, self._bot.botName, self._taskId);

  return this.tradeofferId;
};

BotJob.prototype._executeAcceptOffer = function() {

  // TODO: CHECK THAT A BOT MADE THE OFFER
  var result = this._bot.acceptOffer(this.tradeofferId);

  this._DB.tradeoffers.updateStatus(result);
  this._DB.items.assignItemsToBot(this.items, this._bot.botName);

  // Update all asset after changing everything else since the tradeoffer references the old ids
  this._DB.items.updateAssetIds(this.tradeofferId, this);
};

BotJob.prototype.execute = function(callback) {
  var self = this;
  self._setStatus(Dispatcher.jobStatus.QUEUED);

  var future = new Future();

  function functionForQueue() {
    var err, res;
    self._setStatus(Dispatcher.jobStatus.PENDING);

    try {
      // Use the appropriate function
      if (self.jobType === Dispatcher.jobType.DEPOSIT_ITEMS) {
        res = self._executeDeposit();
      } else if (self.jobType === Dispatcher.jobType.WITHDRAW_ITEMS) {
        res = self._executeWithdrawal();
      } else if (self.jobType === Dispatcher.jobType.INTERNAL_TRANSFER) {
        res = self._executeInternalTransfer();
      } else if (self.jobType === Dispatcher.jobType.ACCEPT_OFFER) {
        res = self._executeAcceptOffer();
      } else {
        throw new Error(self.jobType + ' is not a valid jobtype: ' + self.jobId);
      }

      console.log(res);

      self._setStatus(Dispatcher.jobStatus.COMPLETE);
      future.return(self.tradeofferId);
    } catch(e) {
      console.log(e);
      self.error = e;
      self._setStatus(Dispatcher.jobStatus.FAILED);
      future.throw(e);
    }
  }

  this._bot.enqueue(functionForQueue);
  return future.wait();
};

BotJob.prototype.cancel = function() {

  if (this.tradeofferId) {
    // bot cancel tradeoffer
  }

};

// Saves all non-private fields in a collection
BotJob.prototype._save = function() {

  function replacer(key, value) {
    if (key.charAt(0) === '_')
      return undefined;
    else
      return value;
  }

  // The parse + stringify combo gets rid of all functions and _ prefixed fields
  var doc = JSON.parse(JSON.stringify(this, replacer));
  this._DB.tasks.updateJobHistory(this._taskId, doc);
};

// Set the status and push an update to the task
BotJob.prototype._setStatus = function(status) {
  this.status = status;
  this._save();
};

BOTTEST = function() {

  // items = [{
  //   classId: '341291325',
  //   instanceId: '188530139'
  // }];

  var items = [ '3079813020', '3080132388', '2812184353' ];

  // var options = {
  //   items: items,
  //   steamId: '76561197965124635'
  // };

  Dispatcher.init();

  var bot = Dispatcher.getUsersBot('uYrKadsnCzyg9TLrC');

  bot.loadBotInventory();

  fff = _.pluck(bot.items.find().fetch(), 'id');
  // DB.items.insertNewItems('uYrKadsnCzyg9TLrC','dsf',fff);


  // bot.takeItems('76561197965124635', items);

  // var options = {
  //   partnerSteamId: '76561197965124635',
  //   appId: 730,
  //   contextId: 2
  // };

  // var bot = Dispatcher.getUsersBot('uYrKadsnCzyg9TLrC');
  // bot.offers.loadPartnerInventory(options, function(err, res) {
  //   if (err)
  //     console.log(err);

  //   itemObj = res;
  // });

  // Dispatcher.depositItems('uYrKadsnCzyg9TLrC', items);

};
/*

1. request to add items
  - find bot assigned to user
  - dispatcher adds job to bot queue
  - on job success, bot removes item from queue and starts the next
  - on failure, job is put at the end of the queue and count in incremented
  - need to implement timeout somehow
1. Request to remove items
  - Dispatcher find the items needed and all bots the items are on
  - Dispatcher creates a job or jobs

*/