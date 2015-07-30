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
    else
      botName = user.profile.botName;

    return botName;
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
    PENDING: 'PENDING',
    READY: 'READY'
  }),
});

// Updates DB during each stage, which will be pushed to the client if appropriate
DispatcherTask = function(jobs, ordered) {
  var self = this;

  check(jobs, Array);
  check(ordered, Boolean);

  if (!(jobs.length > 0))
    throw new Error('Bad number of jobs passed to task');

  // Create new collection that we can use to signal all events complete
  this._childrenStatus = new Mongo.Collection(null);

  this._jobs = jobs;
  this._ordered = ordered;


  // We are now ready
  this.status = Dispatcher.jobStatus.READY;
};

DispatcherTask.prototype.execute = function(callback) {
  this.status = Dispatcher.jobStatus.PENDING;

  if (this._ordered === true) {
    // Do each job synchronously
    try {
      this.executeSync();
    } catch(e) {
      // Revert changes in completed jobs
      // log the failure

      // execute callback when complete
      callback(e);
    }
  } else {
    this.executeAsync(callback);
  }
};

DispatcherTask.prototype.executeAsync = function(callback) {
  var self = this;

  var timeout = 15000; // TODO: Should make config value or param


  // This is what will ultimately use our callback
  this._childrenStatus.find().observe({
    changed: function(doc) {

      if (self.status !== Dispatcher.jobStatus.PENDING)
        return;

      var complete = true;
      var err = false;
      _.each(doc, function(value, key) {
        if (key !== '_id') {
          if (value !== Dispatcher.jobStatus.COMPLETE)
            complete = false;

          if (value === Dispatcher.jobStatus.FAILED)
            error = true;
        }
      });

      if (err) {
        self.status = Dispatcher.jobStatus.FAILED;
        callback(seld.errMsg);
      }

      if (complete) {
        self.status = Dispatcher.jobStatus.COMPLETE;
        callback(null);
      }
    }
  });

  // Put callback here to act as a timeout
  Meteor.setTimeout(function() {
    if (self.status === Dispatcher.jobStatus.PENDING) {
      self.cancel();
      callback(new Error('TIMEOUT ' + timeout));
    }
  }, timeout);

  // Execute each callback
  _.each(this._jobs, function(job) {
    job.execute(function(error, result) {
      if (error) {
        if (!self.errMsg)
          self.errMsg = error.message;
      }
    });
  });
};


DispatcherTask.prototype.executeSync = function() {
  var self = this;

  var task = Meteor.wrapAsync(self.executeAsync);
  return task();
}

// TODO: figure out how this will interact with the observe callback
DispatcherTask.prototype.cancel = function() {
    // cancels and rolls back each job
  _.each(this._jobs, function(job) {
    job.cancel();
  });

  this.status = Dispatcher.jobStatus.FAILED;
};

test = function() {
  var self = this;

  var jobs = [{
    execute: function() {
      console.log('2. job begin');
      console.log(task.status)

      Meteor.setTimeout(function() {
        console.log('3. conmplete');
        console.log(task.status);
      });
    }
  }];

  task = new DispatcherTask(jobs, false);

  console.log('1. executing task');
  console.log(task.status);

  task.execute(function() {
    console.log('4. task done')
    console.log(task.status);
  });


  // this.taskStatus = new Mongo.Collection(null);

  // this.taskStatus.find().observe({
  //   added: function(doc) {
  //     console.log(_.keys(doc));
  //   }
  // });
};

// Test.prototype.go = function() {
//   var self = this;

//   Meteor.setTimeout(function() {
//     self.taskStatus.insert({ name: 'drew', face: 'pretty' });
//   }, 3000);
// }