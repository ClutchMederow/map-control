Dispatcher = (function(SteamAPI, SteamBot) {
  var bots = {};

  // Creates a random start index between 0 and bot length - 1
  // Should eventually add some better analysis to determine which bot to use first
  var botIndex = Math.round(Math.random()*(bots.length - 1));

  function initalizeBots(Bots) {

    // Clone this so we can fuck with it
    var botList = _.map(Bots, _.clone);
    var out = {};

    // First run through to initialize
    _.each(botList, function(bot) {
      out[bot.name] = getBot(bot);
    });

    // Loops through all bots and tries to initialize any that failed in the first loop
    var counter = 0;
    var allGood = false;

    while (!allGood && counter <= Config.bots.newBotRetries) {
      allGood = true;

      _.each(out, function(bot, name) {
        if (!out[name]) {
          var botFromList = _.findWhere(botList, { name: name });
          out[name] = getBot(botFromList);
        }

        if (!out[name])
          allGood = false;
      });

      counter++;
    }
    return out;
  }

  function getBot(bot) {
    try {
      return new SteamBot(bot.name, bot.password, bot.authCode, SteamAPI);
    } catch(e) {
      console.log(e);
    }
  }

  return {
    makeTrade: function(userOneId, userOneItems, userTwoId, userTwoItems) {
      var userOne = Meteor.users.findOne(userOneId);
      var userTwo = Meteor.users.findOne(userTwoId);

      if (!userOne || !userTwo)
        return false;

      // Should we throw an error or just return and log?
    },

    init: function() {
      botsFromFile = JSON.parse(Assets.getText('bots.json')).bots;
      bots = initalizeBots(botsFromFile);
      botIndex = Math.round(Math.random()*(bots.length - 1));
    }
  }
})(SteamAPI, SteamBot);
