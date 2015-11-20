//TODO: move DB changes to DB files
TradeHelper = (function () {
  //note: cash can only be on 1 side of trade
  var moveCash = function(item, senderId, receiverId) {
    var withdrawnAmount = item.amount;
    var fee = item.amount * Config.financial.fee;
    var transferredAmount = item.amount - fee;

    if(sufficientIronBucks(senderId, withdrawnAmount)) {
      var adminUser = getAdminUser();
      //remove from user1 full amount
      DB.updateIronBucks(senderId, -withdrawnAmount);
      Logs.insert({
        userId: [senderId],
        amount: -withdrawnAmount,
        type: Enums.LogType.BUY,
        date: new Date()
      });

      //update admin
      DB.updateIronBucks(adminUser._id, fee);
      //Note: basically the sender pays the fee, 
      //because they are debited 100% of the ironBucks but only
      //90% are credited to end user
      Logs.insert({
        userId: [senderId],
        amount: -fee,
        type: Enums.LogType.FEE,
        date: new Date()  
      });

      //update user2
      DB.updateIronBucks(receiverId, transferredAmount);
      Logs.insert({
        userId: [receiverId],
        amount: withdrawnAmount,
        type: Enums.LogType.SELL,
        date: new Date()
      });
      //Logs
    } else {
      throw new Meteor.Error("INSUFFICIENT_FUNDS",
                             "There are not enough funds to handle this amount");
    }

  };

  var moveItem = function(item, receiverId) {
    DB.items.update({ _id: item._id }, {$set: {userId: receiverId}});
  };

  return {
    removeItemsInTransaction: function(transaction) {
      DB.listings.cancelListingsForItems(transaction.user1Items);
      DB.listings.cancelListingsForItems(transaction.user2Items);

      DB.cancelRealTimeTradeForItems(transaction.user1Items);
      DB.cancelRealTimeTradeForItems(transaction.user2Items);
      // _.each(transaction.user1Items, function(item1) {
      //   Items.update({_id: item1._id}, {$pull: {currentTransactions: transaction._id}});
      // });

      // _.each(transaction.user2Items, function(item2) {
      //   Items.update({_id: item2._id}, {$pull: {currentTransactions: transaction._id}});
      // });
    },

    executeTrade: function(transaction) {
      //move user1 items & cash to user 2
      _.each(transaction.user1Items, function(item) {
        //if CASH...
        if(item.name === IronBucks.name) {
          if(item.amount >= Config.financial.unitPriceMax) {
            throw new MeteorError(Enums.MeteorError.UNIT_PRICE_MAC_EXCEEDED, "Cannot buy an item for more than: " + item.amount);
          }
          moveCash(item, transaction.user1Id, transaction.user2Id);
        } else {
          moveItem(item, transaction.user2Id);
        }
      });

      //move user2 items & cash to user 1
      _.each(transaction.user2Items, function(item) {
        //if CASH...
        if(item.name === IronBucks.name) {
          moveCash(item, transaction.user2Id, transaction.user1Id);
        } else {
          moveItem(item, transaction.user1Id);
        }
      });

      Logs.insert({
        date: new Date(),
        type: Enums.LogType.TRADE,
        user1Id: transaction.user1Id,
        user2Id: transaction.user2Id,
        itemsSentToUser1: transaction.user2Items,
        itemsSentToUser2: transaction.user1Items
      });
    }
  };
})();
