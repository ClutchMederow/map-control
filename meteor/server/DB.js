DB = {
  insertChat: function(attributes) {
    Messages.insert({
      user: attributes.user,
      channel: attributes.channel,
      text: attributes.text,
      datePosted: new Date()
    });
  },

  users: {
    update: function(userId, doc) {
      if (!doc.$set)
        throw new Error('INVALID_UPDATE: Must include $set operator');

      return Meteor.users.update(userId, doc);
    },

    // Adds a bot to a user for the first time
    addBot: function(userId, botName) {
      if (!userId || !botName)
        throw new Error('BAD_ARGUMENTS');

      if (Meteor.users.findOne(userId).profile.botName)
        throw new Error('User already has bot assigned: ' + userId);

      var doc = { $set: { 'profile.botName': botName } };
      DB.users.update(userId, doc);

      return Meteor.users.findOne(userId).profile.botName;
    }
  }
};
