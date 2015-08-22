DB = {
  insertChat: function(attributes) {
    Messages.insert({
      user: attributes.user,
      channel: attributes.channel,
      text: attributes.text,
      imageUrls: attributes.imageUrls,
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

      // Removing this for now. I don't think the default here should be an error since
      // there is no harm in someone's items being spread out across bots

      // if (Meteor.users.findOne(userId).profile.botName)
      //   throw new Error('User already has bot assigned: ' + userId);

      var doc = { $set: { 'profile.botName': botName } };
      DB.users.update(userId, doc);

      return Meteor.users.findOne(userId).profile.botName;
    }
  },

  tasks: {
    update: function(taskId, doc) {
      if (!doc.$set && !doc.$push)
        throw new Error('INVALID_UPDATE: Must include $set operator');

      if (!taskId)
        throw new Error('INVALID_UPDATE: Invalid task ID');

      return Tasks.update(taskId, doc);
    },

    insert: function(doc) {
      check(doc.userId, String);
      check(doc.jobType, Match.Where(function(item) {
        return !!Dispatcher.jobType[item];
      }));

      return Tasks.insert(doc);
    },

    updateJobHistory: function(taskId, doc) {
      doc.timestamp = new Date();

      var updater = {
        $push: {
          jobHistory: doc
        }
      };

      return DB.tasks.update(taskId, updater);
    },

    createNew: function(jobType, userId, items) {
      var doc = {
        jobType: jobType,
        userId: userId,
        items: items
      };

      return DB.tasks.insert(doc);
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

    insertNewItems: function(userId, tradeofferId, items) {
      check(userId, String);
      check(items, [String]);

      var existingOwnedItem = Items.findOne({ itemId: { $in: items } });

      if (existingOwnedItem)
        throw new Error('ITEM_ALREADY_OWNED');

      var itemDocs = SteamAPI.getAllItemsForPlayer(userId);
      var filteredItems = _.filter(itemDocs, function(item) {
        return (items.indexOf(item.itemId) !== -1);
      });

      if (!filteredItems || filteredItems.length !== items.length)
        throw new Error('ITEM_COUNT_MISMATCH');

      _.each(filteredItems, function(doc) {
        doc.status = Enums.ItemStatus.PENDING_DEPOSIT;
        doc.tradeofferId = tradeofferId;
        DB.items.insert(doc);
      });
    },

    // Gets an array of item documents from the ids
    getItemsFromIds: function(items) {
      check(items, [String]);

      var out = Items.find({ _id: { $in: items } }).fetch();

      if (out.length !== items.length)
        throw new Error('MISSING_ITEMS', items);

      return out;

      // return _.map(items, function(itemId) {
      //   return Items.findOne(itemId);
      // });
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
  },

  insertPrivateChannel: function(user1Id, user2Id) {
    var requestor = Users.findOne(user1Id);
    var submittor = Users.findOne(user2Id);
    return Channels.insert({
      //shouldn't need name for private chats
      name: Random.id(),
      publishedToUsers: [user1Id, user2Id],
      category: 'Private'
    });
  },

  removeItems: function(userId) {
    Items.remove({userId: userId});
  },

  addListing: function(user,tradeItems, marketItems) {
    var datePosted = new Date();
    Listings.insert({
      user: user,
      items: tradeItems,
      request: marketItems,
      datePosted: datePosted
    });
  },

  removeListing: function(listingId) {
    Listings.remove({_id: listingId});
    //TODO: send notification to anyone watching this listing, etc.
  },

  addOffer: function(userId, listing) {
    var currentDate = new Date();
    Transactions.insert({
      user1Id: listing.user._id,
      user1Items: listing.items,
      user2Id: userId,
      user2Items: listing.request,
      offerDate: currentDate,
      stage: 'INITIAL_OFFER'
    });
    //Note: transaction hook fires to update inventory items
  },

  removeTrade: function(transactionId) {
    //TODO: make this an ENUM
    Transactions.update({_id: transactionId}, {$set: {stage: "CANCELED"}});
  },

  insertRealTimeTrade: function(user1Id, user2Id) {
    RealTimeTrade.insert({
      user1Id: user1Id,
      user2Id: user2Id,
      user1Stage: "INVITED",
      user2Stage: "INVITED"
    });
  },

  acceptRealTimeTrade: function(tradeId, channel) {
    RealTimeTrade.update(tradeId, {$set: {user1Stage: "TRADING",
                         user2Stage: "TRADING",
    channel: channel}});
  },

  rejectRealTimeTrade: function(tradeId) {
    RealTimeTrade.update(tradeId, {$set: {user2Stage: "REJECTED", closeDate: new Date()}});
  },

  addItemToTrade: function(item, tradeId, field) {
    //TODO: for some reason when I use field directly in the push
    //statement below I get a simple schema validation error...
    //this is a little more verbose, but cleaner I suppose
    if(field === "user1Items") {
      RealTimeTrade.update(tradeId, {$push: {user1Items: item}});
    } else if (field === "user2Items") {
      RealTimeTrade.update(tradeId, {$push: {user2Items: item}});
    } else {
      throw new Meteor.Error("INCORRECT_FIELD", "Only item fields allowed");
    }
  },

  removeItemFromTrade: function(item, tradeId, field) {
    if(field === "user1Items") {
      RealTimeTrade.update(tradeId, {$pull: {user1Items: item}});
    } else if (field === "user2Items") {
      RealTimeTrade.update(tradeId, {$pull: {user2Items: item}});
    } else {
      throw new Meteor.Error("INCORRECT_FIELD", "Only item fields allowed");
    }
  },

  setTradeStage: function(tradeId, field, stage) {
    if(field === "user1Stage") {
      RealTimeTrade.update(tradeId, {$set: {user1Stage: stage}});
    } else if (field === "user2Stage") {
      RealTimeTrade.update(tradeId, {$set: {user2Stage: stage}});
    } else {
      throw new Meteor.Error("INCORRECT_FIELD", "Only stage fields allowed");
    }
  },

  checkForTradeCompletion: function(tradeId) {
    var trade = RealTimeTrade.findOne(tradeId);
    if(trade.user1Stage === "CONFIRMED" && trade.user2Stage == "CONFIRMED") {
      //TODO: execute trade
      //Transactions.insert...
      //Dispatcher
    }
  }
};
