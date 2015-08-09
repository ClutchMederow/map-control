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
  },

  transactions: {
    update: function(transactionId, doc) {
      if (!doc.$set && !doc.$push)
        throw new Error('INVALID_UPDATE: Must include $set operator');

      if (!transactionId)
        throw new Error('INVALID_UPDATE: Invalid transaction ID');

      return Transactions.update(transactionId, doc);
    },

    insert: function(doc) {
      check(doc.userId, String);
      check(doc.jobType, Match.Where(function(item) {
        return !!Dispatcher.jobType[item];
      }));

      return Transactions.insert(doc);
    },

    updateJobHistory: function(transactionId, doc) {
      doc.timestamp = new Date();

      var updater = {
        $push: {
          jobHistory: doc
        }
      };

      return DB.transactions.update(transactionId, updater);
    },

    createNew: function(jobType, userId, items) {
      var doc = {
        jobType: jobType,
        userId: userId,
        items: items
      };

      return DB.transactions.insert(doc);
    }
  },

  items: {
    insert: function(doc) {
      return Items.insert(doc);
    },

    update: function(itemId, doc) {
      check(itemId, String);
      if (!doc.$set && !doc.$push)
        throw new Error('INVALID_UPDATE: Must include $set operator');

      return Items.update(itemId, doc);
    },

    addItems: function(items) {
      check(items, Array);

      _.each(items, function(item) {
        if (!item.assetid);
          throw new Error('NO_ASSET_ID');
      });

      _.each(items, function(item) {
        DB.items.insert(item);
      });
    },

    getItemOwner: function(itemId) {
      var item = Items.findOne(itemId);
      if (!item)
        throw new Error('ITEM_NOT_FOUND: ' + itemId);

      var user = Meteor.users.findOne(item.userId);
      if (!user)
        throw new Error('USER_NOT_FOUND: ' + item.userId);

      return user;
    },

    reassignOwner: function(itemId, newUserId) {
      doc = {
        $set: {
          userId: newUserId
        }
      };

      var out = DB.items.update(itemId, doc);

      if (out !== 1)
        throw new Error('ITEM_NOT_UPDATED');

      return out;
    }
  }
};
