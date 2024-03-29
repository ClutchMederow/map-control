var partialDB = {
  // for dev purposes - REMOVE
  migrate: function() {
    Meteor.users.find().forEach(function(user) {
      Meteor.users.update(user._id, {$set: {
        "profile.ironBucks": 0,
        "profile.firstTimeUser": true
      }});
    });
  },

  insertChat: function(attributes) {
    Messages.insert({
      user: attributes.user,
      channel: attributes.channel,
      text: attributes.text,
      items: attributes.items,
      datePosted: new Date()
    });
  },

  insertPrivateChat: function(attributes) {

    // Shows the channel if a user has it hidden
    var thisChannel = Channels.findOne(attributes.channel._id);
    var userIds = _.pluck(thisChannel.users, 'userId');
    var hiddenUsers = _.without(userIds, thisChannel.show);

    // increments the unseen
    var otherUsers = _.difference(userIds, [ attributes.user.userId ]);

    _.each(otherUsers, function(other) {
      DB.addUnseen(attributes.channel._id, other);
    });

    if (hiddenUsers.length) {
      Channels.update(thisChannel._id, { $addToSet: { show: { $each: hiddenUsers } } });
    }

    return DB.insertChat(attributes);
  },

  users: {
    update: function(userId, doc) {
      if (!doc.$set)
        throw new Error('INVALID_UPDATE: Must include $set operator');

      doc.$set.modifiedTimestamp = new Date();

      return Meteor.users.update({ _id: userId }, doc);
    },

    // Adds a bot to a user for the first time
    addBot: function(userId, botName) {
      if (!userId || !botName)
        throw new Error('BAD_ARGUMENTS');

      var doc = { $set: { 'profile.botName': botName } };
      DB.users.update({ _id: userId }, doc);

      return Meteor.users.findOne({ _id: userId }).profile.botName;
    },

    updateTradeURL: function(userId, tradeURL, email) {
      check(userId, String);
      check(tradeURL, String);
      check(email, String);

      var token = tradeURL.split("token=")[1];

      if (!token) {
        throw new Error('BAD_TRADE_URL: ' + tradeURL);
      }

      var doc = {
        $set: {
          'profile.tradeURL': tradeURL,
          'profile.tradeToken': token,
          'profile.email': email
        }
      };

      return DB.users.update(userId, doc);
    }
  },

  tasks: {
    update: function(taskId, doc) {
      if (!doc.$set && !doc.$push)
        throw new Error('INVALID_UPDATE: Must include $set operator');

      if (!taskId)
        throw new Error('INVALID_UPDATE: Invalid task ID');

      if (!doc.$set) {
        doc.$set = {};
      }
      doc.$set.modifiedTimestamp = new Date();

      console.log(taskId);

      return Tasks.update({ _id: taskId }, doc);
    },

    insert: function(doc) {
      check(doc.userId, String);
      check(doc.jobType, Match.Where(function(item) {
        return !!Dispatcher.jobType[item];
      }));

      doc.createdTimestamp = new Date();
      doc.modifiedTimestamp = new Date();

      return Tasks.insert(doc);
    },

    updateJobHistory: function(taskId, doc) {
      console.log('updateJobHistory');
      console.log(taskId);

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

      doc.createdTimestamp = new Date();
      doc.modifiedTimestamp = new Date();

      return Tradeoffers.insert(doc);
    },

    update: function(selector, doc) {
      check(selector, Object);
      check(doc, Object);

      var setDoc = {
        $set: doc
      };

      setDoc.$set.modifiedTimestamp = new Date();

      return Tradeoffers.update(selector, setDoc);
    },

    insertNew: function(id, tradeofferId, userId, jobType, botName, taskId, otherBotName) {
      check(id, String);
      check(tradeofferId, String);
      check(userId, String);
      check(jobType, String);
      check(botName, String);
      check(taskId, String);
      check(otherBotName, Match.Optional(String));

      var doc = {
        _id: id,
        tradeofferid: tradeofferId,
        trade_offer_state: 2,
        userId: userId,
        jobType: jobType,
        taskId: taskId,
        botName: botName,
        deleteInd: false
      };

      if (otherBotName) {
        doc.otherBotName = otherBotName;
      }

      return DB.tradeoffers.insert(doc);
    },

    updateStatus: function(doc) {
      check(doc, Object);

      var selector = {
        tradeofferid: doc.tradeofferid,
        deleteInd: false
      };

      if (!SteamConstants.offerStatus[doc.trade_offer_state]) {
        throw new Error('Invalid state - trade_offer_state:' + doc.trade_offer_state);
      }

      return DB.tradeoffers.update(selector, doc);
    }
  },

  items: {
    insert: function(doc) {
      check(doc, Object);

      doc.createdTimestamp = new Date();
      doc.modifiedTimestamp = new Date();

      return Items.insert(doc);
    },

    update: function(selector, doc, options) {
      var options = options || {};

      check(selector, Object);
      check(doc, Object);
      check(options, Object);

      if (!doc.$set && !doc.$push)
        throw new Error('INVALID_UPDATE: Must include $set operator: Items');

      doc.$set.modifiedTimestamp = new Date();

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

      var options = { multi: true };

      // Logically delete the item if it is not a part of our ecosystem
      if (status === Enums.ItemStatus.EXTERNAL) {
        doc.$set.deleteInd = true;
      }

      return DB.items.update(selector, doc, options);
    },

    // Revert status in the case of an error
    revertStatus: function(assetIds) {
      check(assetIds, [String]);

      _.each(assetIds, function(assetId) {
        var item = Items.findOne({ itemId: assetId, deleteInd: false });
        var doc;

        if (!item) return;

        if (item.status === Enums.ItemStatus.PENDING_WITHDRAWAL) {
          doc = {
            $set: {
              status: Enums.ItemStatus.STASH
            }
          };
        } else if (item.status === Enums.ItemStatus.PENDING_DEPOSIT) {
          doc = {
            $set: {
              status: Enums.ItemStatus.EXTERNAL,
              deleteInd: true
            }
          };
        }

        var selector = {
          itemId: assetId,
          deleteInd: false
        };

        if (doc) {
          DB.items.update(selector, doc, {});
        }
      });
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
        var doc = { $set: { botName: newBotName } };
        var result = DB.items.update({ itemId: itemId, deleteInd: false }, doc);
        if (!result) {
          throw new Error('Item not found, bot reassingment failed: ' + itemId + ' ' + newBotName);
        }
      });
    },

    // assetids can change with every trade, and there is no good way to map them
    // To handle this, we update the assetids grouped by tradeoffer
    // If the fields in mapping all match, then we can assume with some certainty that it is the
    // same item. If a user trades two items with the same name etc., then they may get switched in
    // our system. This shouldn't matter since each tradeoffer should only involve a single user,
    // so there shouldn't be an issue if the assetids are mixed up
    updateAssetIds: function(offerId, bot) {

      var offer = Tradeoffers.findOne({ tradeofferid: offerId });

      // Only the receiver is responsible for updating asset ids
      // Case 1: We receive items in a deposit, thus we update the assetids
      // Case 2: We make an internal trade, thus the receiving bot updates assetids
      // Case 3: We give items in a withdrawal, thus we don't care about assetids

      if (offer.tradeid && offer.items_to_receive) {
        var itemIds = _.pluck(offer.items_to_receive, 'assetid');


        // get the new items using the tradeid (essentially the receipt id)
        var newItems = bot.getNewItemIds(offer.tradeid);
        var oldItems = Items.find({ itemId: { $in: itemIds } }).fetch();

        // bot.loadBotInventory();
        // var newItems = bot.items.find({ assetid: { $in: itemIds } }).fetch();

        ////////////////

        // Get the newItems from the mongooffer
        // we need to map new items to old - Items should still be out of date, but the offer
        // should be updated
        // as usual, find a better way to do this

        //////////////

        // if each field specified matches the old items, update the assetid
        _.find(oldItems, function(item) {
          for (var i = 0; i < newItems.length; i++) {
            var thisNewItem = newItems[i];

            var mapping = [
              ['name_color', 'nameColor'],
              ['type', 'type'],
              ['amount', 'amount'],
              ['market_name', 'name']
            ];

            var match = true;
            for (field in mapping) {

              // Single equals here to handle number/string comparisons
              if (thisNewItem[field[0]] != item[field[1]]) {
                match = false;
              }
            }

            if (match) {

              var doc = {
                $set: {
                  itemId: thisNewItem.id,
                  classId: thisNewItem.classid,
                  instanceId: thisNewItem.instanceid,
                  iconURL: Constants.steamCDN + thisNewItem.icon_url,
                },
                $push: {
                  oldAssetIds: item.itemId
                }
              };

              // Update all fields
              DB.items.update({ _id: item._id }, doc, {});

              // Remove the item so it doesn't get matched again
              newItems.splice(i, 1);

              return true;
            }
          }
        });
      }
    },

    // This must be called BEFORE updating the assetIds since the tradeoffer references the old IDs
    updateStatusFromOffer: function(offerId, bot) {
      check(offerId, String);

      var updatedOffer = Tradeoffers.findOne({ tradeofferid: offerId });

      if (updatedOffer.tradeofferid && SteamConstants.offerStatus[updatedOffer.trade_offer_state]) {

        var state = SteamConstants.offerStatus[updatedOffer.trade_offer_state];
        var jobType = updatedOffer.jobType;
        var received = _.pluck(updatedOffer.items_to_receive, 'assetid');
        var given = _.pluck(updatedOffer.items_to_give, 'assetid');

        if (state === 'k_ETradeOfferStateAccepted') {
          if (jobType === Dispatcher.jobType.DEPOSIT_ITEMS) {

            DB.items.changeStatus(updatedOffer.tradeofferid, received, Enums.ItemStatus.STASH);

          } else if (jobType === Dispatcher.jobType.WITHDRAW_ITEMS) {

            DB.items.changeStatus(updatedOffer.tradeofferid, given, Enums.ItemStatus.EXTERNAL);
          }
        } else if (state === 'k_ETradeOfferStateDeclined') {
          if (jobType === Dispatcher.jobType.DEPOSIT_ITEMS) {

            DB.items.changeStatus(updatedOffer.tradeofferid, received, Enums.ItemStatus.EXTERNAL);

          } else if (jobType === Dispatcher.jobType.WITHDRAW_ITEMS) {

            bot.loadBotInventory();
            var botItems = bot.items.findOne({ itemId: { $in: given } });


            ////////////////////
            // Verify that the item in in the bots inventory first
            // see https://www.reddit.com/r/SteamBot/comments/3edynt/psa_reminder_dont_run_your_web_application_and/
            // note 1
            ///////////////////
            if (botItems) {
              DB.items.changeStatus(updatedOffer.tradeofferid, given, Enums.ItemStatus.STASH);
            } else {
              DB.items.changeStatus(updatedOffer.tradeofferid, given, Enums.ItemStatus.EXTERNAL);
            }
          }
        }
      }
    }
  },

  startChat: function(user1Id, user2Id, chatType) {
    check(user1Id, String);
    check(user2Id, String);

    var requestor = Users.findOne(user1Id);
    var otherUser = Users.findOne(user2Id);

    if (!requestor || !otherUser) {
      throw new Error('NO_USER_FOUND');
    }

    var chatSelector = { $and: [
      { 'users.userId': user1Id },
      { 'users.userId': user2Id },
      { category: 'Private' }
    ]};

    var currentChat = Channels.findOne(chatSelector);

    // If a channel between the two users already exists, just show it
    // otherwise, create a new one
    if (currentChat) {

      var doc = {
        $set: { chatType: chatType }
      };

      var isShown = (currentChat.show.indexOf(user1Id) > -1);
      if (!isShown) {
        doc.$push = { show: Meteor.userId() };
      }

      // Update the channel with chat type and let them know a new message has arrived
      Channels.update(currentChat._id, doc);
    } else {
      DB.insertPrivateChannel(requestor, otherUser);
    }
  },

  updateUnseen: function(channelId, userId) {
    check(channelId, String);
    check(userId, String);

    var selector = { _id: channelId, 'users.userId': userId };
    var doc = { $set: { 'users.$.unseen': 0 } };

    Channels.update(selector, doc);
  },

  addUnseen: function(channelId, userId) {
    check(channelId, String);
    check(userId, String);

    var selector = { _id: channelId, 'users.userId': userId };
    var doc = { $inc: { 'users.$.unseen': 1 } };
    Channels.update(selector, doc);
  },

  insertPrivateChannel: function(requestor, otherUser, chatType) {
    return Channels.insert({
      //shouldn't need name for private chats
      name: requestor.profile.name + '_' + otherUser.profile.name + Math.round(Math.random()*100),
      publishedToUsers: [ requestor._id, otherUser._id ],
      users: [{
        userId: requestor._id,
        name: requestor.profile.name,
        avatar: requestor.services.steam.avatar,
        unseen: 0
      }, {
        userId: otherUser._id,
        name: otherUser.profile.name,
        avatar: requestor.services.steam.avatar,
        unseen: 0
      }],
      show: [ requestor._id, otherUser._id ],
      category: 'Private',
      chatType: chatType
    });
  },

  addOffer: function(userId, listing, offeredItems) {
    check(userId, String);

    var lister = Meteor.users.findOne(listing.user._id);
    var offerer = Meteor.users.findOne(userId);

    check(lister, Object);
    check(offerer, Object);

    const realtimeId = RealTimeTrade.insert({
      user1Id: lister._id,
      user1Items: listing.items,
      user1Name: lister.profile.name,
      user2Id: offerer._id,
      user2Items: offeredItems,
      user2Name: offerer.profile.name,
      user1Stage: "DONE",
      user2Stage: "DONE",
      listingId: listing._id,
      createdTimestamp: new Date(),
      modifiedTimestamp: new Date()
    });

    Meteor.users.update(userId, {$inc: {"profile.totalOffers": 1}});
    const messageText = `${offerer.profile.name} has made you an offer on your listing`;
    const data = {
      alertType: 'offerMade',
    };
    DB.addNotification(lister._id, messageText, data);
  },

  insertRealTimeTrade: function(user1Id, user2Id) {
    var user1 = Meteor.users.findOne(user1Id);
    var user2 = Meteor.users.findOne(user2Id);

    check(user1, Object);
    check(user2, Object);

    return RealTimeTrade.insert({
      user1Id: user1Id,
      user1Name: user1.profile.name,
      user2Id: user2Id,
      user2Name: user2.profile.name,
      user1Stage: "INVITED",
      user2Stage: "INVITED",
      completed: false,
      createdTimestamp: new Date(),
      modifiedTimestamp: new Date()
    });
  },

  acceptRealTimeTrade: function(tradeId, channel) {
    var doc = {
      $set: {
        user1Stage: "TRADING",
        user2Stage: "TRADING",
        channel: channel,
        modifiedTimestamp: new Date()
      }
    };

    RealTimeTrade.update(tradeId, doc);
  },

  cancelRealTimeTradeForItems: function(items) {
    // Ignore cash
    var items = _.reject(items, function(item) {
      return item.name === IronBucks.name;
    });

    if (!items.length) return 0;

    var itemIds = _.pluck(items, '_id');

    var selector1 = {
      'user1Items._id': { $in: itemIds },
      closeDate: { $exists: false }
    };

    var selector2 = {
      'user2Items._id': { $in: itemIds },
      closeDate: { $exists: false }
    };

    var doc = {
      $set: {
        closeDate: new Date(),
        closeReason: Enums.TradeCloseReason.ITEM_NOT_AVAILABLE
      }
    };

    RealTimeTrade.update(selector1, doc, { multi: true });
    RealTimeTrade.update(selector2, doc, { multi: true });
  },

  rejectRealTimeTrade: function(tradeId) {
    var doc = {
      //TODO: figure out better way to do rejections so we can log who rejected
      //what?
      //TODO: add logging
      $set: {
        user1Stage: "REJECTED",
        user2Stage: "REJECTED",
        completed: true,
        closeDate: new Date(),
        modifiedTimestamp: new Date()
      }
    };

    RealTimeTrade.update(tradeId, doc);
  },

  // addItemToTrade: function(item, tradeId, field) {
  //   //TODO: for some reason when I use field directly in the push
  //   //statement below I get a simple schema validation error...
  //   //this is a little more verbose, but cleaner I suppose
  //   if(field === "user1Items") {
  //     RealTimeTrade.update(tradeId, {$push: {user1Items: item}, $set: { modifiedTimestamp: new Date() } });
  //   } else if (field === "user2Items") {
  //     RealTimeTrade.update(tradeId, {$push: {user2Items: item}, $set: { modifiedTimestamp: new Date() } });
  //   } else {
  //     throw new Meteor.Error("INCORRECT_FIELD", "Only item fields allowed");
  //   }
  // },

  // removeItemFromTrade: function(item, tradeId, field) {
  //   if(field === "user1Items") {
  //     RealTimeTrade.update(tradeId, {$pull: {user1Items: item}, $set: { modifiedTimestamp: new Date() } });
  //   } else if (field === "user2Items") {
  //     RealTimeTrade.update(tradeId, {$pull: {user2Items: item}, $set: { modifiedTimestamp: new Date() } });
  //   } else {
  //     throw new Meteor.Error("INCORRECT_FIELD", "Only item fields allowed");
  //   }
  // },

  setTradeStage: function(tradeId, field, stage) {
    if(field === "user1Stage") {
      RealTimeTrade.update(tradeId, {$set: { user1Stage: stage, modifiedTimestamp: new Date() } });
    } else if (field === "user2Stage") {
      RealTimeTrade.update(tradeId, {$set: { user2Stage: stage, modifiedTimestamp: new Date() } });
    } else {
      throw new Meteor.Error("INCORRECT_FIELD", "Only stage fields allowed");
    }
  },

  setRealTimeCompleted: function(tradeId) {
    RealTimeTrade.update(tradeId, { $set: { completed: true } });
  },

  checkForTradeCompletion: function(tradeId) {
    try {
      var trade = RealTimeTrade.findOne(tradeId);

      if(trade.user1Stage === "CONFIRMED" && trade.user2Stage === "CONFIRMED") {
        var transId = DB.transactions.initialize(trade.user1Id, trade.user1Items, trade.user2Id, trade.user2Items);

        DB.transactions.changeStage(transId, Enums.TransStage.ACCEPTED);
        DB.setRealTimeCompleted(tradeId);

        return transId;
      }
    } catch (e) {

      DB.setTradeStage(tradeId, "user1Stage", "TRADING");
      DB.setTradeStage(tradeId, "user2Stage", "TRADING");

      throw e;
    }
  },
  //pass in positive number for adding ironBucks
  //pass in negative number of removing ironBucks
  //Note: $inc will create field if it doesn't exist
  updateIronBucks: function(userId, amount) {
    const numericAmount = parseFloat(amount);
    var logData = {
      userId:  [userId],
      amount: numericAmount,
      date: new Date(),
    };

    if(numericAmount < 0) {
      logData.type = Enums.LogType.DEBIT;
    } else {
      logData.type = Enums.LogType.CREDIT;
    }

    console.log("userId: " + userId);
    console.log("amount: " + amount);
    Meteor.users.update(userId, {$inc: {"profile.ironBucks": numericAmount}});
    Logs.insert(logData);
  },

  addNotification: function(userId, message, data) {
    Notifications.insert({
      userId,
      message,
      data,
      viewed: false,
      createdTimestamp: new Date(),
    });
  },

  updateIronBucksCallback: function(body) {
    var order = body.body.order;
    var customer = body.body.customer;

    //note: have to collect user email when they register?
    //or maybe use uuid?
    if(order.status === 'completed') {
      var email = order.metadata.email;
      var user = Meteor.users.findOne({"profile.email": email});

      if(!_.isObject(user)) {
        //TODO
        console.log("couldn't find user...ERROR");
      } else {
        var amount = parseFloat(order.total_native.cents) / 100;

        DB.updateIronBucks(user._id, amount);
      }
    } else {
      //TODO
      console.log('order not completed correctly');
    }
  },
  removeListing: function(listingId) {
    Listings.remove(listingId);
  }
};

_.extend(DB, partialDB);
