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

  //TODO: this code is not DRY, combine with checkwithdrawal code
  var sumFinancials = function(logType, userId) {
    var sum = 0;

    Logs.find({userId: userId, type: logType}).forEach(function(log) {
      sum += log.amount;
    });

    return sum;
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
    },
    //given a user, check to see if their prior deposits in the specified time
    //period are below a specified amount
    //return true if deposits are below threshold and current deposit can
    //proceed
    //return false if it cannot
    checkWithdrawal: function(userId) {
      var sumPreviousWithdrawals = sumFinancials(Enums.LogType.DEBIT, userId);
      console.log(sumPreviousWithdrawals);
      if(sumPreviousWithdrawals >= Config.financial.maxWithdrawAmount) {
        return false;
      } else {
        return true;
      }
    },
    //given a user, check to see if their prior deposits in the specified time
    //period are below a specified amount
    //return true if deposits are below threshold and current deposit can
    //proceed
    //return false if it cannot
    checkDeposit: function(userId) {
      var sumPreviousDeposits = sumFinancials(Enums.LogType.CREDIT, userId);
      console.log(sumPreviousDeposits);
      if(sumPreviousDeposits >= Config.financial.maxAddAmount) {
        return false;
      } else {
        return true;
      }
    }
  };
})();
