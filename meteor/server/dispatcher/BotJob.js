
BotJob = function(bot, jobType, options) {

  // TODO: DISPATCHER ASSIGNS A BOT

  if (!(bot instanceof SteamBot))
    throw new Error('NOT_A_BOT');

  if (jobType === Jobs.JobType.DEPOSIT_ITEMS) {

    check(options, {
      items: Array,
      userId: String
    });

    // Check the array to be sure we can identify the item
    _.each(options.items, function(item) {
      check(item, {
        classId: Number,
        instanceId: Number
      });
    });

    if (items.length < 1)
      throw new Error('NO_ITEMS');

    this._itemsNoAssetId = options.items;
  }

  this.bot = bot;
  this.userId = userId;
  this.jobType = jobType;
  this.status = Jobs.JobStatus.READY;
  this.jobId = Math.round(Math.random()*1000); //////// ---------------THIS NEEDS TO ACTUALLY COME FROM INSERTION INTO A COLLECTION
};

BotJob.prototype._executeDeposit = function() {

  // Make trade request

  //

};

BotJob.prototype._addToQueue = function (callback) {

  // Enqueues the callback
  // Maybe this should be the same as execute ... get rid of it

}

BotJob.prototype.execute = function() {

};

BotJob.prototype.cancel = function() {

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