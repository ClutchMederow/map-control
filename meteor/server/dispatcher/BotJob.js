
BotJob = function(bot, jobType, transactionId, options, DBLayer) {

  if (!(bot instanceof SteamBot))
    throw new Error('INVALID_BOT');

  if (items.length < 1)
    throw new Error('NO_ITEMS');

  check(transactionId, String);
  check(DBLayer, Object);

  if (jobType === Dispatcher.jobType.DEPOSIT_ITEMS) {

    check(options, {
      items: Array,
      steamId: String
    });

    // Check the array to be sure we can identify the item
    _.each(options.items, function(item) {
      check(item, {
        classId: String,
        instanceId: String
      });
    });

    this.itemsNoAssetId = options.items;
  } else if (jobType === Dispatcher.jobType.WITHDRAW_ITEMS) {

    check(options, {
      items: [Number],
      steamId: String
    });

    this.itemAssetIds = items;
  }

  // private fields
  this._transactionId = transactionId;
  this._bot = bot;

  // We pass in DB here for easy mocking during tests
  this._DB = DBLayer;

  // Fields to be stringified
  this.steamId = options.steamId;
  this.jobType = jobType;
  this.jobId = Random.id();

  this._setStatus(Dispatcher.jobStatus.READY);
};

BotJob.prototype._executeDeposit = function() {
  var self = this;
  self._setStatus(Dispatcher.jobStatus.PENDING);

  // Find item assetIds
  self.items = self._bot.getItemObjsWithIds(self.steamId, self.itemsNoAssetId);

  // Make the tradeoffer
  self.tradeofferId = self._bot.takeItems(self.steamId, self.items);
};

BotJob.prototype._executeWithdrawal = function() {

  // var self = this;
  // self._setStatus(Dispatcher.jobStatus.PENDING);

  // // Find item assetIds
  // self.items = self._bot.getItemObjsWithIds(self.steamId, self.itemsNoAssetId);

  // // Make the tradeoffer
  // self.tradeofferId = self._bot.takeItems(self.steamId, self.items);
};

BotJob.prototype.execute = function(callback) {
  var self = this;
  self._setStatus(Dispatcher.jobStatus.QUEUED);

  function functionForQueue() {
    var err, res;

    try {
      // Use the appropriate function
      if (self.jobType === Dispatcher.jobType.DEPOSIT_ITEMS) {
        res = self._executeDeposit();
      }
    } catch(e) {
      err = e;
    }

    if (err) {
      self.error = err.message;
      self._setStatus(Dispatcher.jobStatus.FAILED);
    } else {
      self._setStatus(Dispatcher.jobStatus.COMPLETE);
    }

    // Don't forget the callback!
    callback(err, res);
  }

  this._bot.enqueue(functionForQueue);
};

BotJob.prototype.cancel = function() {

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
  this._DB.transactions.updateJobHistory(this._transactionId, doc);
};

// Set the status and push an update to the transaction
BotJob.prototype._setStatus = function(status) {
  this.status = status;
  this._save();
};

BOTTEST = function(pw) {
  // bot = new SteamBot('meatsting', pw, 'KJ8RH', SteamAPI);
  // var trans = Transactions.insert({ name: 'test1' });

  items = [{
    classId: '341291325',
    instanceId: '188530139'
  }];

  // var options = {
  //   items: items,
  //   steamId: '76561197965124635'
  // };

  // job = new BotJob(bot, Dispatcher.jobType.DEPOSIT_ITEMS, trans, options);

  Dispatcher.init();
  Dispatcher.depositItems('uYrKadsnCzyg9TLrC', items);

  // job.execute(function(err, res) {

  //   console.log(err);
  //   console.log(res);

  // });
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