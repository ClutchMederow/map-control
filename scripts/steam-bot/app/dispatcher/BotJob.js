// var DB = require('../../../meteor/server/db/db.js');
var Future = require('fibers/future');
var _ = require('underscore');
var Constants = require('../Constants');

var BotJob = function(bot, jobType, taskId, options, DBLayer) {

  if (!(bot instanceof SteamBot))
    throw new Error('INVALID_BOT');

  // check(taskId, String);
  // check(DBLayer, Object);

  // private fields
  this._taskId = taskId;
  this._bot = bot;

  // We pass in DB here for easy mocking during tests
  this._DB = DBLayer;

  // Fields to be stringified
  this.jobType = jobType;
  this.jobId = Random.id();

  // Set up the object depending on job type
  if (jobType === Constants.jobType.DEPOSIT_ITEMS) {

    // check(options, {
    //   items: [String],
    //   userId: String
    // });

    if (options.items.length < 1)
      throw new Error('NO_ITEMS');

    this.userId = options.userId;
    this.items = options.items;

  } else if (jobType === Constants.jobType.WITHDRAW_ITEMS) {

    // check(options, {
    //   items: [String],
    //   userId: String
    // });

    if (options.items.length < 1)
      throw new Error('NO_ITEMS');

    this.userId = options.userId;
    this.items = options.items;

  } else if (jobType === Constants.jobType.INTERNAL_TRANSFER) {

    // check(options, {
    //   items: [String],
    //   otherBot: SteamBot
    // });

    this.items = options.items;
    this._otherBot = options.otherBot;
    this.otherBotName = options.otherBot.botName;
    this.userId = '_BOT_' + this._bot.botName;

  } else if (jobType === Constants.jobType.ACCEPT_OFFER) {

    // check(options, {
    //   tradeofferId: String,
    // });

    this.tradeofferId = options.tradeofferId;
  }

  this._setStatus(Constants.jobStatus.READY);
};

BotJob.prototype._executeDeposit = function() {
  var self = this;

  // Find item assetIds
  // var itemsWithAssetIds = self._bot.getItemObjsWithIds(self.steamId, self._itemDocuments);
  var steamId = Meteor.users.findOne({ _id: this.userId }).services.steam.id;
  var tradeToken = Meteor.users.findOne({ _id: this.userId }).profile.tradeToken;

  if (!tradeToken) {
    console.log('INVALID_TOKEN, steamid: ' + steamId);
    throw new Meteor.Error(Enums.MeteorError.INVALID_TOKEN, 'Your trade URL is invalid. Please go to your profile to fix it.');
  }

  var id = Random.id();
  var message = 'Deposit ID: ' + id;

  // Make the tradeoffer
  self.tradeofferId = self._bot.takeItems(steamId, tradeToken, self.items, message);

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
  var steamId = Meteor.users.findOne({ _id: this.userId }).services.steam.id;
  var tradeToken = Meteor.users.findOne({ _id: this.userId }).profile.tradeToken;

  if (!tradeToken) {
    throw new Error('INVALID_TOKEN, steamid: ' + steamId);
  }

  var id = Random.id();
  var message = 'Withdrawl ID: ' + id;

  // Make the tradeoffer
  self.tradeofferId = self._bot.giveItems(steamId, tradeToken, self.items, message);

  // Save the tradeoffer
  self._DB.tradeoffers.insertNew(id, self.tradeofferId, self.userId, self.jobType, self._bot.botName, self._taskId);

  return this.tradeofferId;
};

BotJob.prototype._executeInternalTransfer = function() {
  var self = this;

  var steamId = this._otherBot.getSteamId();
  var tradeToken = this._otherBot.tradeToken;
  var id = Random.id();
  var message = 'Transfer ID: ' + id;

  // Make the tradeoffer
  self.tradeofferId = self._bot.giveItems(steamId, tradeToken, self.items, message);

  // Save the tradeoffer
  self._DB.tradeoffers.insertNew(id, self.tradeofferId, self.userId, self.jobType, self._bot.botName, self._taskId, self.otherBotName);

  return this.tradeofferId;
};

BotJob.prototype._executeAcceptOffer = function() {

  // TODO: CHECK THAT A BOT MADE THE OFFER
  this._bot.acceptOffer(this.tradeofferId);
  var result = this._bot.getSingleOffer(this.tradeofferId);

  this._DB.tradeoffers.updateStatus(result);

  var offer = Tradeoffers.findOne({ tradeofferid: this.tradeofferId });

  this.items = _.pluck(offer.items_to_receive, 'assetid');
  this._DB.items.assignItemsToBot(this.items, this._bot.botName);

  // Update all asset after changing everything else since the tradeoffer references the old ids
  this._DB.items.updateAssetIds(this.tradeofferId, this);
};

BotJob.prototype.execute = function(callback) {
  var self = this;
  self._setStatus(Constants.jobStatus.QUEUED);

  var future = new Future();

  function functionForQueue() {
    if (self.cancelQueue) {
      future.return();
    }

    var err, res;
    self._setStatus(Constants.jobStatus.PENDING);

    try {
      // Use the appropriate function
      if (self.jobType === Constants.jobType.DEPOSIT_ITEMS) {
        res = self._executeDeposit();
      } else if (self.jobType === Constants.jobType.WITHDRAW_ITEMS) {
        res = self._executeWithdrawal();
      } else if (self.jobType === Constants.jobType.INTERNAL_TRANSFER) {
        res = self._executeInternalTransfer();
      } else if (self.jobType === Constants.jobType.ACCEPT_OFFER) {
        res = self._executeAcceptOffer();
      } else {
        throw new Error(self.jobType + ' is not a valid jobtype: ' + self.jobId);
      }

      // If a cancel was called for during the execution of this function,
      // we just add an extra function call here to execute once it is complete
      if (self.cancelCallback) {
        self.cancelCallback();
        self._setStatus(Constants.jobStatus.CANCELLED);
      } else {
        self._setStatus(Constants.jobStatus.COMPLETE);
      }

      future.return(self.tradeofferId);
    } catch(e) {
      console.log(e);
      self.error = e;
      self._setStatus(Constants.jobStatus.FAILED);
      future.throw(e);
    }
  }

  this._bot.enqueue(functionForQueue);
  return future.wait();
};

BotJob.prototype.cancel = function() {
  var self = this;

  // If queued, nothing else needs to be done
  if (self.jobStatus === Constants.jobStatus.QUEUED || self.jobStatus === Constants.jobStatus.READY) {

    this.cancelQueue = true;

  } else if (self.jobStatus === Constants.jobStatus.PENDING) {

    if (self.jobType === Constants.jobType.DEPOSIT_ITEMS ||
        self.jobType === Constants.jobType.WITHDRAW_ITEMS ||
        self.jobType === Constants.jobType.INTERNAL_TRANSFER) {

      this.cancelCallback = function() {
        self._bot.cancelOffer(self.tradeofferId);
      }
    }
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

module.exports = BotJob;