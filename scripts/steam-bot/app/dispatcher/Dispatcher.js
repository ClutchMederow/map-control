var _ = require('underscore');
var Constants = require('../Constants');
var BotJob = require('./BotJob');
var Task = require('./Task');
var Enums = require('../Enums');
var Fiber = require('fibers');

var Dispatcher = function(SteamBot, DB, Collections) {

  // Holds objects that represent all bots, using the botName as the key
  var bots = {};

  // Used to determine which bot the next person should get
  var botIndex = 0;

  var checkOutstandingPollHandle;

  function initalizeBots(allBots) {

    // Clone this so we can fuck with it
    var botList = _.map(allBots, _.clone);
    var out = {};

    // First run through to initialize
    _.each(botList, function(bot) {
      out[bot.name] = getNewBot(bot);
    });

    // Loops through all bots and tries to initialize any that failed in the first loop
    var counter = 0;
    var allGood = false;

    while (!allGood && counter <= Config.bots.newBotRetries) {
      allGood = true;

      _.each(out, function(bot, name) {
        if (!out[name]) {
          var botFromList = _.findWhere(botList, { name: name });
          out[name] = getNewBot(botFromList);
        }

        if (!out[name])
          allGood = false;
      });

      counter++;
    }
    return out;
  }

  // Attempts to procure a new bot
  function getNewBot(bot) {
    try {
      return new SteamBot(bot);
    } catch(e) {
      console.log(e);
    }
  }

  // Gets a user's bot if it exists, otherwise assigns one
  function getUsersBot (userId) {
    var user = Meteor.users.findOne({ _id: userId });
    var botName;

    if (!user || !user.profile)
      throw new Error('UNKNOWN_USER');

    if (!user.profile.botName) {
      botName = DB.users.addBot(userId, assignBot());
    } else if (!bots[user.profile.botName]) {
      botName = DB.users.addBot(userId, assignBot());
    } else {
      botName = user.profile.botName;
    }

    var usersBot = bots[botName];

    if (!usersBot) {
      throw new Error('OUT_OF_BOTS', 'There are no bots available to process your request');
    }

    // Verify that the bot assigned to the player has enough space
    if (usersBot.getItemCount() > Config.bots.maxBotInventory * Config.bots.maxFullPercentage) {
      botName = DB.users.addBot(userId, assignBot());
    }

    return usersBot;
  }

  function assignBot() {
    var botWithMinInv;
    var currentBest = Config.bots.maxBotInventory * Config.bots.maxFullPercentage;

    _.each(bots, function(thisBot, botName) {
      var itemCount = thisBot.getItemCount()

      if (itemCount < currentBest) {
        botWithMinInv = botName;
        currentBest = itemCount;
      }
    });

    if (!botWithMinInv) {
      throw new Error('OUT_OF_BOTS');
    }

    return botWithMinInv;
    // botIndex = (botIndex + 1)%(_.keys(bots).length);
    // return _.keys(bots)[botIndex];
  }

  // Only updates the status on offers sent externally
  // Internal transfers will be handled by the receiving bot
  function updateTradeofferStatus(offers, bot) {
    _.each(offers, function(offer) {
      try {
        var oldOffer = Tradeoffers.findOne({ tradeofferid: offer.tradeofferid });

        // Remove this after testing - there should never not be an old offer
        if (oldOffer) {
          if (oldOffer.jobType === Constants.jobType.DEPOSIT_ITEMS ||
              oldOffer.jobType === Constants.jobType.WITHDRAW_ITEMS) {
            updateOffer(offer, oldOffer, bot);
          }
        }
      } catch(e) {
        throw e;
        // console.warn(e);
      }
    });
  }

  function updateOffer(offer, oldOffer, bot) {
    if (!oldOffer.time_updated || offer.time_updated > oldOffer.time_updated) {

      // Update the tradeoffer
      DB.tradeoffers.updateStatus(offer);

      // Update all items involved in the tradeoffer if external
      DB.items.updateStatusFromOffer(offer.tradeofferid, bot);

      // Update the assetids
      DB.items.updateAssetIds(offer.tradeofferid, bot);
    }
  }

  function getJobsToSendOffers(transferBot, groupedItems, taskId) {
    if (groupedItems[transferBot.botName]) {
      delete groupedItems[transferBot.botName];
    }

    var sendOffersJobs = _.map(groupedItems, function(itemArray, botName) {
      var bot = bots[botName];
      var options = {
        items: itemArray,
        otherBot: transferBot
      };
      return new BotJob(bot, Constants.jobType.INTERNAL_TRANSFER, taskId, options, DB);
    });

    return sendOffersJobs;
  }

  function getJobsToAcceptOffers(transferBot, offerIdsToAccept, acceptTaskId) {

    var acceptanceJobs = _.map(offerIdsToAccept, function(tradeofferId) {
      var options = { tradeofferId: tradeofferId };
      return new BotJob(transferBot, Constants.jobType.ACCEPT_OFFER, acceptTaskId, options, DB);
    });

    return acceptanceJobs;
  }

  return {
    getBot: function(botName) {
      // check(botName, String);

      return bots[botName];
    },

    getUsersBot: getUsersBot,

    getBotSteamId: function(botName) {
      // check(botName, String);

      if (!bots[botName]) {
        throw new Error('Bot does not exist for botName: ' + botName);
      }

      return bots[botName].steam
    },

    depositItems: function(userId, items) {
      // check(userId, String);
      // check(items, [String]);

      console.log(0);

      var bot = getUsersBot(userId);

      var options = {
        items: items,
        userId: userId
      };

      console.log(1);
      var taskId = DB.tasks.createNew(Constants.jobType.DEPOSIT_ITEMS, userId, items)._id;

      console.log(2);
      var job = new BotJob(bot, Constants.jobType.DEPOSIT_ITEMS, taskId, options, DB);

      console.log(3);
      var task = new Task([job], false, taskId, DB);

      try {
        console.log(4);
        task.execute();
      } catch (e) {
        console.log(5);
        DB.items.revertStatus(items);

        if (e.toString().indexOf('has declined your trade request') > -1) {
          throw new Error(Enums.MeteorError.DECLINED_TRADE, 'There was an error sending your request. Please try again later.');
        } else {
          throw e;
        }
      }

      return job.tradeofferId;
    },

    withdrawItems: function(userId, items) {
      // check(userId, String);
      // check(items, [String]);

      if (!items.length) {
        throw new Meteor.Error('BAD_ARGUMENTS', 'No items in transaction');
      }

      if (!Items.ensureItemsInStash(items)) {
        throw new Meteor.Error('INVALID_ITEMS', 'Not all requested items are in the stash and cannot be withdrawn');
      }

      try {

        var transferBot = getUsersBot(userId);

        if (!transferBot) {
          throw new Meteor.Error('No bots available');
        }

        var mongoItems = Items.find({ itemId: { $in: items } }).fetch();
        var persistentIds = _.pluck(mongoItems, '_id');

        // Group all items by the bot they are on
        try {
          var groupedItems = _.groupBy(items, function(itemId) {
            return Items.findStashItem(itemId).botName;
          });
        } catch(err) {
          err.reason = 'Item not found in stash';
          throw err;
        }

        // Change the status so they can't be involved in any other transactions
        var test = DB.items.changeStatus(Constants.jobType.INTERNAL_TRANSFER, items, Enums.ItemStatus.PENDING_WITHDRAWAL);

        // Create the task to send out all trade offers to internal bots
        var taskId = DB.tasks.createNew(Constants.jobType.INTERNAL_TRANSFER, userId, items);
        var sendOffersJobs = getJobsToSendOffers(transferBot, groupedItems, taskId);

        // Only execute if items are not already on the bot
        if (sendOffersJobs.length) {
          var sendRequestsTask = new Task(sendOffersJobs, false, taskId, DB);

          // Returns an array of all tradeofferids that need to be accepted
          var offerIdsToAccept = sendRequestsTask.execute();

          // Create the task to accept all internal outstanding tradeoffers
          var acceptTaskId = DB.tasks.createNew(Constants.jobType.ACCEPT_OFFER, userId, null);
          var acceptanceJobs = getJobsToAcceptOffers(transferBot, offerIdsToAccept, acceptTaskId);
          var acceptOffersTask = new Task(acceptanceJobs, false, acceptTaskId, DB);

          // Accept all offers
          acceptOffersTask.execute();
        }

        // Grab any updated itemIds since assetIds can change during transfers
        items = _.pluck(Items.find({ _id: { $in: persistentIds } }).fetch(), 'itemId');

        // Create final job to send all offers to the user
        var options = {
          items: items,
          userId: userId
        };

        var sendItemsToUserTaskId = DB.tasks.createNew(Constants.jobType.WITHDRAW_ITEMS, userId, items);
        var withdrawJob = new BotJob(transferBot, Constants.jobType.WITHDRAW_ITEMS, sendItemsToUserTaskId, options, DB);
        var withdrawTask = new Task([withdrawJob], false, sendItemsToUserTaskId, DB);

        // Cancel all existing transactions
        DB.listings.cancelListingsForItems(mongoItems);
        DB.cancelRealTimeTradeForItems(mongoItems);

        withdrawTask.execute();

        return withdrawJob.tradeofferId;

      } catch (e) {
        DB.items.revertStatus(items);
        throw e;
      }
    },

    init: function() {
      var self = this;

      // Grab all the bots we have
      // botsFromFile = JSON.parse(Assets.getText('bots.json')).bots;
      var botsFromMongo = Bots.find({ enabled: true }).fetch();

      // Initialize them
      bots = initalizeBots(botsFromMongo);

      // Set the initial index so we aren't biased toward bot 0
      botIndex = Math.round(Math.random()*(_.keys(bots).length - 1));

      console.log('Bots initialized. Count: ' + _.keys(bots).length);
    },

    disconnect: function() {
      _.each(bots, function(bot) {
        bot.disconnect();
      });
    },

    checkOutstandingTradeoffers: function() {
      Fiber(function() {
        _.each(bots, function(bot) {
          try {
            var offers = bot.queryOffers();

            // Reload the inventory so we can match items
            // May be null if unable to connect to steam servers
            if (offers) {
              updateTradeofferStatus(offers, bot);
              bot.cancelOldOffers();
            }

          } catch (e) {
            console.log(bot.botName + ': Error checking outstanding tradeoffers');
            console.log(e.stack);
          }
        });
      }).run();
    },

    startPolling: function() {
      console.log('Polling started');
      var self = this;
      console.log(self.checkOutstandingTradeoffers);
      checkOutstandingPollHandle = setInterval(self.checkOutstandingTradeoffers, Config.bots.checkOutstandingInterval);
    },

    stopPolling: function() {
      console.log('Polling stopped');
      if (checkOutstandingPollHandle) {
        clearInterval(checkOutstandingPollHandle);
      }
    },

    botsLogOn: function() {
      var counter = 0;
      var failures = 0;

      _.each(bots, function(bot) {
        try {

          if (bot.loggedOn()) {
            bot.webLogOn();
          } else {
            bot.logOn();
          }

          counter++;

        } catch(e) {

          console.log(e);
          console.log(e.eresult);

        }
      });

      console.log(counter + ' bots successfully logged on');

      if (failures) {
        console.log(failures + ' bots failed to log on');
      }
    },

    fixItem: function(itemMongoId) {
      var item = Items.findOne({ _id: itemMongoId });

      var offers = Tradeoffers.find({
        items_to_receive: { $elemMatch: { assetid: item.itemId }}
      }, {
        sort: { createdTimestamp: -1 }
      }).fetch();

      var offer = offers[0];
      var botName = this.getBot(offer.otherBotName);
      var bot = this.getBot(botName);

      // fix the bot name
      DB.items.assignItemsToBot([item], botName);

      // Update the assetids
      DB.items.updateAssetIds(offer.tradeofferid, bot);

    },

    tradeItemToBot: function(itemId, newBotName) {
      var item = Items.findOne({ itemId: itemId });
      var newBot = Dispatcher.getBot(newBotName);
      var oldBot = Dispatcher.getBot(item.botName);

      var taskId = DB.tasks.createNew(Constants.jobType.INTERNAL_TRANSFER, 'internal', [ itemId ]);
      var options = {
        items: [ itemId ],
        otherBot: newBot
      };
      var job = new BotJob(oldBot, Constants.jobType.INTERNAL_TRANSFER, taskId, options, DB);

      var offerIdsToAccept = job.execute();

      // Create the task to accept all internal outstanding tradeoffers
      var acceptTaskId = DB.tasks.createNew(Constants.jobType.ACCEPT_OFFER, 'internal', null);
      var acceptanceJobs = getJobsToAcceptOffers(newBot, offerIdsToAccept, acceptTaskId);
      var acceptOffersTask = new Task(acceptanceJobs, false, acceptTaskId, DB);

      // Accept all offers
      acceptOffersTask.execute();
    },
  };
};

module.exports = Dispatcher;