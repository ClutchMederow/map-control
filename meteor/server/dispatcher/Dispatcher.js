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

    if (!user.profile.botName)
      botName = DB.users.addBot(userId, assignBot());
    else if (!bots[user.profile.botName])
      botName = DB.users.addBot(userId, assignBot());
    else
      botName = user.profile.botName;

    return bots[botName];
  }

  function assignBot() {
    botIndex = (botIndex + 1)%(_.keys(bots).length);
    return _.keys(bots)[botIndex];
  }

  function enQueue(jobType, items) {
    if (jobType === JobType.DEPOSIT_ITEMS) {
      var options = {

      }

      var job = new QueueJob();
    }
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

    depositItems: function(userId, items) {
      check(userId, String);
      check(items, Array);

      var bot = getUsersBot(userId);
      var user = Meteor.users.findOne(userId);

      var options = {
        items: items,
        steamId: user.services.steam.id
      };

      var taskId = DB.tasks.createNew(Dispatcher.jobType.DEPOSIT_ITEMS, userId, items);

      var job = new BotJob(bot, Dispatcher.jobType.DEPOSIT_ITEMS, taskId, options, DB);
      var task = new Task([job], false, taskId, DB);

      task.execute(function(err, res) {
        console.log(err, res);
      });
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

    test: function() {
      console.log(getUsersBot('kiGYGwyyuM7h3RfvT'));
      // console.log(assignBot());
    }
  }
})(SteamAPI, SteamBot);

_.extend(Dispatcher, {
  jobType: Object.freeze({
    DEPOSIT_ITEMS: 'DEPOSIT_ITEMS',
    DEPOSIT_CASH: 'DEPOSIT_CASH',
    WITHDRAW_ITEMS: 'WITHDRAW_ITEMS',
    WITHDRAW_CASH: 'WITHDRAW_CASH',
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
