Dispatcher = (function(SteamAPI, SteamBot) {

  // Holds objects that represent all bots, using the botName as the key
  var bots = {};

  // Used to determine which bot the next person should get
  var botIndex = 0;

  function initalizeBots(Bots) {

    // Clone this so we can fuck with it
    var botList = _.map(Bots, _.clone);
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
      return new SteamBot(bot.name, bot.password, bot.authCode, SteamAPI);
    } catch(e) {
      console.log(e);
    }
  }

  // Gets a user's bot if it exists, otherwise assigns one
  function getUsersBot (userId) {
    var user = Meteor.users.findOne(userId);
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
      throw new Meteor.Error('OUT_OF_BOTS');
    }

    return botWithMinInv;
    // botIndex = (botIndex + 1)%(_.keys(bots).length);
    // return _.keys(bots)[botIndex];
  }

  function updateTradeofferStatus(offers) {
    _.each(offers, function(offer) {
      try {

        console.log(offer.tradeofferid);
        var oldOffer = Tradeoffers.findOne({ tradeofferid: offer.tradeofferid });
        if (oldOffer) {
          if (!oldOffer.time_updated || offer.time_updated > oldOffer.time_updated) {
            DB.tradeoffers.updateStatusFromAPI(offer);
          }
        }
      } catch(e) {
        throw e;
        // console.warn(e);
      }
    });
  }

  function getJobsToSendOffers(transferBot, groupedItems, taskId) {
    var sendOffersJobs = _.chain(groupedItems)
      .filter(function(thisBot, botName) {
        return botName !== transferBot.botName;
      })
      .map(function(itemArray, botName) {
        var bot = bots[botName];
        var options = {
          items: itemArray,
          userId: userId
        };

        return new BotJob(bot, Dispatcher.jobType.INTERNAL_TRANSFER, taskId, options, DB);
      })
      .value();

    return sendOffersJobs;
  }

  function getJobsToAcceptOffers(transferBot, offerIdsToAccept, acceptTaskId) {

    var acceptanceJobs = _.map(offerIdsToAccept, function(tradeofferId) {
      var options = { tradeofferId: tradeofferId };
      return new BotJob(transferBot, Dispatcher.jobType.ACCEPT_OFFER, acceptTaskId, options, DB);
    });

    return acceptanceJobs;
  }

  return {
    makeTrade: function(userOneId, userOneItems, userTwoId, userTwoItems) {
      var userOne = Meteor.users.findOne(userOneId);
      var userTwo = Meteor.users.findOne(userTwoId);

      if (!userOne || !userTwo)
        throw new Meteor.Error('INVALID_USERID', 'Invalid user ID');

      // get users' bots
      var botOne = getUsersBot(userOneId);
      var botTwo = getUsersBot(userTwoId);

      // Have bot1 create tradeoffer
      var callback = function() {

      };

      // Tell bot2 to accept tradeoffer in success callback

      // BOTS FUCK YEAH
    },

    getBot: function(botName) {
      check(botName, String);

      return bots[botName];
    },

    getUsersBot: getUsersBot,

    getBotSteamId: function(botName) {
      check(botName, String);

      if (!bots[botName]) {
        throw new Error('Bot does not exist for botName: ' + botName);
      }

      return bots[botName].steam
    },

    depositItems: function(userId, items) {
      check(userId, String);
      check(items, [String]);

      var bot = getUsersBot(userId);

      var options = {
        items: items,
        userId: userId
      };

      var taskId = DB.tasks.createNew(Dispatcher.jobType.DEPOSIT_ITEMS, userId, items);

      var job = new BotJob(bot, Dispatcher.jobType.DEPOSIT_ITEMS, taskId, options, DB);
      var task = new Task([job], false, taskId, DB);

      task.execute();

      return job.tradeofferId;
    },

    withdrawItems: function(userId, items) {
      check(userId, String);
      check(items, [String]);

      if (!items.length) {
        throw new Meteor.Error('BAD_ARGUMENTS', 'No items in transaction');
      }

      if (!Items.ensureItemsInStash(items)) {
        throw new Meteor.Error('INVALID_ITEMS', 'Not all requested items are in the stash and cannot be withdrawn');
      }

      try {

        var transferBot = getUsersBot(userId);

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
        var test = DB.items.changeStatus(Dispatcher.jobType.INTERNAL_TRANSFER, items, Enums.ItemStatus.PENDING_WITHDRAWAL);

        // Create the task to send out all trade offers to internal bots
        var taskId = DB.tasks.createNew(Dispatcher.jobType.INTERNAL_TRANSFER, userId, items);
        var sendOffersJobs = getJobsToSendOffers(transferBot, groupedItems, taskId);

        // Only execute if items are not already on the bot
        if (sendOffersJobs.length) {
          var sendRequestsTask = new Task(sendOffersJobs, false, taskId, DB);

          // Returns an array of all tradeofferids that need to be accepted
          var offerIdsToAccept = sendRequestsTask.execute();

          // Create the task to accept all internal outstanding tradeoffers
          var acceptTaskId = DB.tasks.createNew(Dispatcher.jobType.ACCEPT_OFFER, userId, null);
          var acceptanceJobs = getJobsToAcceptOffers(transferBot, offerIdsToAccept, acceptTaskId);
          var acceptOffersTask = new Task(acceptanceJobs, false, acceptTaskId, DB);

          // Accept all offers
          acceptOffersTask.execute();
        }


        // Check if any items are on this bot already
        // var itemsOnThisBot = groupedItems[transferBot.botName];

        // Create final job to send all offers to the user
        var options = {
          items: items,
          userId: userId
        };
        var sendItemsToUserTaskId = DB.tasks.createNew(Dispatcher.jobType.WITHDRAW_ITEMS, userId, items);
        var withdrawJob = new BotJob(transferBot, Dispatcher.jobType.WITHDRAW_ITEMS, sendItemsToUserTaskId, options, DB);
        var withdrawTask = new Task([withdrawJob], false, sendItemsToUserTaskId, DB);

        withdrawTask.execute();

      } catch (e) {
        // DB.items.changeStatus('Failed withdrawal', items, Enums.ItemStatus.STASH);
        console.log(e);
        throw e;
      }
    },

    init: function() {
      var self = this;

      // Grab all the bots we have
      botsFromFile = JSON.parse(Assets.getText('bots.json')).bots;

      // Initialize them
      bots = initalizeBots(botsFromFile);

      // Set the initial index so we aren't biased toward bot 0
      botIndex = Math.round(Math.random()*(_.keys(bots).length - 1));

      console.log('Bots initialized. Count: ' + _.keys(bots).length);
    },

    checkOutstandingTradeoffers: function() {
      _.each(bots, function(bot) {
        var offers = bot.queryOffers();
        updateTradeofferStatus(offers);
      });
    },

    test: function() {
      // console.log(getUsersBot('kiGYGwyyuM7h3RfvT'));


      // var botWithMinInv = _.reduce(bots, function(currentBest, thisBot, botName) {
      //     var count = thisBot.getItemCount();

      //     if (count < currentBest.itemCount) {
      //       return { botName: botName, itemCount: count };
      //     } else {
      //       return currentBest;
      //     }
      //   }, { botName: null, itemCount: maxItemCount });



      return assignBot();

    }
  }
})(SteamAPI, SteamBot);

_.extend(Dispatcher, {
  jobType: Object.freeze({
    DEPOSIT_ITEMS: 'DEPOSIT_ITEMS',
    WITHDRAW_ITEMS: 'WITHDRAW_ITEMS',
    INTERNAL_TRANSFER: 'INTERNAL_TRANSFER',
    TASK: 'TASK'
  }),

  jobStatus: Object.freeze({
    COMPLETE: 'COMPLETE',
    FAILED: 'FAILED',
    ROLLBACK_FAILED: 'ROLLBACK_FAILED',
    QUEUED: 'QUEUED',
    PENDING: 'PENDING',
    READY: 'READY',
    TIMEOUT: 'TIMEOUT'
  }),
});
