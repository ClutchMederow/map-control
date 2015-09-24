// Hooks

// // Updates every item after a tradeoffer is updated
// Tradeoffers.after.update(function(userId, doc, fieldNames, modifier) {

//   // Dont execute this logic for internal transfers
//   if (doc.internal) {
//     return;
//   }

// });

DB = {
  insertChat: function(attributes) {
    Messages.insert({
      user: attributes.user,
      channel: attributes.channel,
      text: attributes.text,
      items: attributes.items,
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

  tradeoffers: {
    insert: function(doc) {
      check(doc, Object);

      return Tradeoffers.insert(doc);
    },

    update: function(selector, doc) {
      check(selector, Object);
      check(selector, Object);

      var setDoc = {
        $set: doc
      };

      return Tradeoffers.update(selector, setDoc);
    },

    insertNew: function(id, tradeofferId, userId, jobType, botName) {
      var doc = {
        _id: id,
        tradeofferid: tradeofferId,
        trade_offer_state: 2,
        userId: userId,
        jobType: jobType,
        botName: botName,
        deleteInd: false,
        internal: true
      };

      return DB.tradeoffers.insert(doc);
    },

    // // Doc should be exact object returned from API call
    // updateStatus: function(doc) {
      // check(doc, Object);

      // var selector = {
      //   tradeofferid: doc.tradeofferid,
      //   deleteInd: false
      // };

      // if (!SteamConstants.offerStatus[doc.trade_offer_state]) {
      //   throw new Error('Invalid state - trade_offer_state:' + doc.trade_offer_state);
      // }

      // return DB.tradeoffers.update(selector, doc);
    // },

    // Doc should be exact object returned from API call
    updateStatus: function(doc) {
      check(doc, Object);

      var selector = {
        tradeofferid: doc.tradeofferid,
        deleteInd: false
      };

      if (!SteamConstants.offerStatus[doc.trade_offer_state]) {
        throw new Error('Invalid state - trade_offer_state:' + doc.trade_offer_state);
      }

      // Update the status
      var out = DB.tradeoffers.update(selector, doc);

      var updatedOffer = Tradeoffers.findOne({ tradeofferid: doc.tradeofferid });


      //////// TODO
      // Add logic here to change the state of the item based on offerStatus and jobType
      // May need to manually update DB jobType to get this to work
      ////////////

      // Update all items involved in the tradeoffer if external
      if (!updatedOffer.internal) {
        if (updatedOffer.tradeofferid && SteamConstants.offerStatus[updatedOffer.trade_offer_state]) {
          var state = SteamConstants.offerStatus[updatedOffer.trade_offer_state];
          if (state === 'k_ETradeOfferStateAccepted') {

            // We know what to change to status to by which are being received and given
            var received = _.pluck(updatedOffer.items_to_receive, 'assetid');
            var given = _.pluck(updatedOffer.items_to_give, 'assetid');

            if (received.length) {
              DB.items.changeStatus(updatedOffer.tradeofferid, received, Enums.ItemStatus.STASH);
            }

            if (given.length) {
              DB.items.changeStatus(updatedOffer.tradeofferid, given, Enums.ItemStatus.EXTERNAL);
            }
          } else if (state === 'k_ETradeOfferStateDeclined') {
            var received = _.pluck(updatedOffer.items_to_receive, 'assetid');

            if (received.length) {
              DB.items.changeStatus(updatedOffer.tradeofferid, received, Enums.ItemStatus.EXTERNAL);
            }
          }
        }
      }

      return out;
    }
  },

  items: {
    insert: function(doc) {
      return Items.insert(doc);
    },

    update: function(selector, doc, options) {
      var options = options || {};

      check(selector, Object);
      check(doc, Object);
      check(options, Object);

      if (!doc.$set && !doc.$push)
        throw new Error('INVALID_UPDATE: Must include $set operator: Items');

      return Items.update(selector, doc, options);
    },

    insertNewItems: function(userId, tradeofferId, items, botName) {
      check(userId, String);
      check(tradeofferId, String);
      check(items, [String]);
      check(botName, String);

      var existingOwnedItem = Items.findOne({ itemId: { $in: items }, status: Enums.ItemStatus.STASH, deleteInd: false });

      if (existingOwnedItem) {
        if (existingOwnedItem.status === Enums.ItemStatus.PENDING_DEPOSIT) {
          throw new Meteor.Error('Item pending deposit');
        } else if (existingOwnedItem.status === Enums.ItemStatus.STASH) {
          throw new Meteor.Error('Item already in stash');
        }
      }

      var itemDocs = SteamAPI.getAllItemsForPlayer(userId);
      var filteredItems = _.filter(itemDocs, function(item) {
        return (items.indexOf(item.itemId) !== -1);
      });

      if (!filteredItems || filteredItems.length !== items.length)
        throw new Error('ITEM_COUNT_MISMATCH');

      _.each(filteredItems, function(doc) {
        doc.status = Enums.ItemStatus.PENDING_DEPOSIT;
        doc.botName = botName;
        doc.tradeofferId = tradeofferId;
        DB.items.insert(doc);
      });
    },

    // Gets an array of item documents from the ids
    getItemsFromIds: function(items) {
      check(items, [String]);

      var out = Items.find({ _id: { $in: items, deleteInd: false } }).fetch();

      if (out.length !== items.length)
        throw new Error('MISSING_ITEMS', items);

      return out;

      // return _.map(items, function(itemId) {
      //   return Items.findOne(itemId);
      // });
    },

    getItemOwner: function(itemId) {
      var item = Items.findOne({ _id: itemId, deleteInd: false });
      if (!item)
        throw new Error('ITEM_NOT_FOUND: ' + itemId);

      var user = Meteor.users.findOne(item.userId);
      if (!user)
        throw new Error('USER_NOT_FOUND: ' + item.userId);

      return user;
    },

    reassignOwner: function(itemId, newUserId) {
      check(itemId, String);
      check(newUserId, String);

      var doc = {
        $set: {
          userId: newUserId
        }
      };
      var selector = {
        _id: itemId,
        deleteInd: false
      };
      var options = { multi: true };

      var out = DB.items.update(selector, doc, options);

      if (out !== 1)
        throw new Error('ITEM_NOT_UPDATED');

      return out;
    },

    changeStatus: function(tradeofferId, assetIds, status) {
      check(tradeofferId, String);
      check(assetIds, [String]);
      check(status, Match.Where(function() {
        return !!Enums.ItemStatus[status];
      }));

      var selector = {
        itemId: { $in: assetIds },
        deleteInd: false
      };

      var doc = {
        $set: {
          status: status
        }
      };

      // Logically delete the item if it is not a part of our ecosystem
      if (status === Enums.ItemStatus.EXTERNAL) {
        doc.$set.deleteInd = true;
      }

      return DB.items.update(selector, doc);
    },

    getItemBot: function(itemId, userId) {
      check(itemId, String);
      check(userId, String);

      var item =  Items.findOne({ userId: userId, itemId: itemId, status: Enums.ItemStatus.STASH });
      if (!item) {
        throw new Error('Item not found: ' + itemId)
      }

      return item.botName;
    },

    assignItemsToBot: function(items, newBotName) {
      check(items, [String]);
      check(newBotName, String);

      _.each(items, function(itemId) {
        var doc = { $set: { botName: botName } };
        var result = DB.items.update({ itemId: item, deleteInd: false }, doc);
        if (!result) {
          throw new Error('Item not found, bot reassingment failed: ' + item + ' ' + newBotName);
        }
      });
    }
  },

  insertPrivateChannel: function(user1Id, user2Id) {
    var requestor = Users.findOne(user1Id);
    var submittor = Users.findOne(user2Id);

    if (!requestor || !submittor) {
      throw new Error('NO_USER_FOUND');
    }

    return Channels.insert({
      //shouldn't need name for private chats
      name: requestor.profile.name + '_' + submittor.profile.name + Math.round(Math.random()*100),
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
