var _ = require('underscore');
var Random = require('../lib/random');
var Enums = require('../constants/Enums');
var SteamAPI = require('../lib/steamAPI');
var DbListings = require('./db_listings');
var assign = require('object-assign');
var SteamConstants = require('../constants/SteamConstants');
var Constants = require('../constants/Constants');
var IronBucks = require('../lib/IronBucks');

var DB = {
  users: {
    update: function(userId, doc) {
      if (!doc.$set) {
        throw new Error('INVALID_UPDATE: Must include $set operator');
      }

      doc.$set.modifiedTimestamp = new Date();

      return Meteor.users.update({ _id: userId }, doc);
    },

    // Adds a bot to a user for the first time
    addBot: function(userId, botName) {
      if (!userId || !botName) {
        throw new Error('BAD_ARGUMENTS');
      }

      var doc = { $set: { 'profile.botName': botName } };
      DB.users.update({ _id: userId }, doc);

      return Meteor.users.findOne({ _id: userId }).profile.botName;
    },
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

      return Tasks.update({ _id: taskId }, doc).result.n;
    },

    insert: function(doc) {
      // check(doc.userId, String);
      // check(doc.jobType, Match.Where(function(item) {
      //   return !!Constants.jobType[item];
      // }));

      doc.createdTimestamp = new Date();
      doc.modifiedTimestamp = new Date();
      doc._id = doc._id || Random.id();

      Tasks.insert(doc);
      return doc._id;
    },

    updateJobHistory: function(taskId, doc) {
      doc.timestamp = new Date();

      var updater = {
        $push: {
          jobHistory: doc
        }
      };

      var selector = { _id: taskId };

      return DB.tasks.update(selector, updater);
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
      // check(doc, Object);

      doc.createdTimestamp = new Date();
      doc.modifiedTimestamp = new Date();
      doc._id = doc._id || Random.id();

      Tradeoffers.insert(doc);
      return doc._id;
    },

    update: function(selector, doc) {
      // check(selector, Object);
      // check(doc, Object);

      var setDoc = {
        $set: doc
      };

      setDoc.$set.modifiedTimestamp = new Date();

      return Tradeoffers.update(selector, setDoc).result.n;
    },

    insertNew: function(id, tradeofferId, userId, jobType, botName, taskId, otherBotName) {
      // check(id, String);
      // check(tradeofferId, String);
      // check(userId, String);
      // check(jobType, String);
      // check(botName, String);
      // check(taskId, String);
      // check(otherBotName, Match.Optional(String));

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
      // check(doc, Object);

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
      // check(doc, Object);

      doc.createdTimestamp = new Date();
      doc.modifiedTimestamp = new Date();
      doc._id = doc._id || Random.id();

      Items.insert(doc);
      return doc._id;
    },

    update: function(selector, doc, options) {
      var options = options || {};

      // check(selector, Object);
      // check(doc, Object);
      // check(options, Object);

      if (!doc.$set && !doc.$push)
        throw new Error('INVALID_UPDATE: Must include $set operator: Items');

      doc.$set.modifiedTimestamp = new Date();

      return Items.update(selector, doc, options).result.n;
    },

    insertNewItems: function(userId, tradeofferId, items, botName) {
      // check(userId, String);
      // check(tradeofferId, String);
      // check(items, [String]);
      // check(botName, String);

      var existingOwnedItem = Items.findOne({ itemId: { $in: items }, status: Enums.ItemStatus.STASH, deleteInd: false });

      if (existingOwnedItem) {
        if (existingOwnedItem.status === Enums.ItemStatus.PENDING_DEPOSIT) {
          throw new Error('Item pending deposit');
        } else if (existingOwnedItem.status === Enums.ItemStatus.STASH) {
          throw new Error('Item already in stash');
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

    changeStatus: function(tradeofferId, assetIds, status) {
      // check(tradeofferId, String);
      // check(assetIds, [String]);
      // check(status, Match.Where(function() {
      //   return !!Enums.ItemStatus[status];
      // }));

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
      // check(assetIds, [String]);

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

    assignItemsToBot: function(items, newBotName) {
      // check(items, [String]);
      // check(newBotName, String);

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
        _.each(oldItems, function(item) {
          for (var i = 0; i < newItems.length; i++) {
            var thisNewItem = newItems[i];

            var mapping = [
              ['name_color', 'nameColor'],
              ['type', 'type'],
              ['amount', 'amount'],
              ['market_name', 'name']
            ];

            var match = true;
            for (var field in mapping) {

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

              break;
            }
          }
        });
      }
    },

    // This must be called BEFORE updating the assetIds since the tradeoffer references the old IDs
    updateStatusFromOffer: function(offerId, bot) {
      // check(offerId, String);

      var updatedOffer = Tradeoffers.findOne({ tradeofferid: offerId });

      if (updatedOffer.tradeofferid && SteamConstants.offerStatus[updatedOffer.trade_offer_state]) {

        var state = SteamConstants.offerStatus[updatedOffer.trade_offer_state];
        var jobType = updatedOffer.jobType;
        var received = _.pluck(updatedOffer.items_to_receive, 'assetid');
        var given = _.pluck(updatedOffer.items_to_give, 'assetid');

        if (state === 'k_ETradeOfferStateAccepted') {
          if (jobType === Constants.jobType.DEPOSIT_ITEMS) {

            DB.items.changeStatus(updatedOffer.tradeofferid, received, Enums.ItemStatus.STASH);

          } else if (jobType === Constants.jobType.WITHDRAW_ITEMS) {

            DB.items.changeStatus(updatedOffer.tradeofferid, given, Enums.ItemStatus.EXTERNAL);
          }
        } else if (state === 'k_ETradeOfferStateDeclined') {
          if (jobType === Constants.jobType.DEPOSIT_ITEMS) {

            DB.items.changeStatus(updatedOffer.tradeofferid, received, Enums.ItemStatus.EXTERNAL);

          } else if (jobType === Constants.jobType.WITHDRAW_ITEMS) {

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
};

DB.listings = DbListings;

module.exports = DB;
