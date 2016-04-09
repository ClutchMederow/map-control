//TODO: move DB changes to DB files
TradeHelper = (function () {
  const calculateFee = function(amount) {
    var fee = amount * Config.financial.fee;
    return fee.toFixed(2);
  }

  const getMoneyToMove = function(amount) {
    const fee = calculateFee(amount);
    const paidAmount = amount - fee;
    return {
      fee,
      paidAmount,
    };
  }

  //note: cash can only be on 1 side of trade
  const moveCash = function(item, senderId, receiverId) {
    const debitedAmount = item.amount;
    const { fee, paidAmount } = getMoneyToMove(debitedAmount);

    var adminUser = getAdminUser();
    //remove from user1 full amount
    DB.updateIronBucks(senderId, -debitedAmount);
    Logs.insert({
      userId: [senderId],
      amount: -debitedAmount,
      type: Enums.LogType.BUY,
      date: new Date()
    });

    //update admin
    DB.updateIronBucks(adminUser._id, roundedFee);
    //Note: basically the sender pays the fee,
    //because they are debited 100% of the ironBucks but only
    //90% are credited to end user
    Logs.insert({
      userId: [senderId],
      amount: -roundedFee,
      type: Enums.LogType.FEE,
      date: new Date()
    });

    //update user2
    DB.updateIronBucks(receiverId, transferredAmount);
    Logs.insert({
      userId: [receiverId],
      amount: debitedAmount,
      type: Enums.LogType.SELL,
      date: new Date()
    });
  };

  var moveItem = function(item, receiverId) {
    DB.items.update({ _id: item._id }, {$set: {userId: receiverId}});

    Logs.insert({
      userId: [receiverId],
      item,
      type: Enums.LogType.MOVE_ITEM,
      date: new Date(),
    });
  };

  //TODO: this code is not DRY, combine with checkwithdrawal code
  var sumFinancials = function(logType, userId) {
    var sum = 0;

    Logs.find({userId: userId, type: logType}).forEach(function(log) {
      sum += log.amount;
    });

    return sum;
  };

  function getCashForUserInTransaction(field, transaction) {
    return transaction[field]
      .filter(item => item.name === IronBucks.name)
      .reduce((acc, item) => item.amount + acc, 0);
  }

  // const getIronBucksForUser = (transaction, userFieldName) => Meteor.users.findOne(transaction[userFieldName]).profile.ironBucks;

  const userHasItem = R.curry(function(userId, { _id }) {
    return !!Items.findOne({ _id, userId });
  });

  const checkIfUserHasAllItems = function(userId, items) {
    return R.all(userHasItem(userId))(items);
  };

  const checkIfBothUsersHaveItems = function(transaction) {
    const { user1Items, user2Items, user1Id, user2Id } = transaction;
    const isGood = checkIfUserHasAllItems(user1Id, user1Items) && checkIfUserHasAllItems(user2Id, user2Items);
    if (!isGood) {
      throw new Meteor.Error('BAD_ITEMS', 'Incorrect items');
    }
  };

  const checkIfBothUsersHaveSufficientFunds = function(transaction) {
    const { user1Id, user2Id } = transaction;
    const user1CashToDebit = getCashForUserInTransaction('user1Items', transaction);
    const user2CashToDebit = getCashForUserInTransaction('user2Items', transaction)
    const isGood = sufficientIronBucks(user1Id, user1CashToDebit) && sufficientIronBucks(user2Id, user2CashToDebit);
    if (!isGood) {
      throw new Meteor.Error('NOT_SUFFICIENT_FUNDS', 'Insuffient funds');
    }
  };

  const checkThatNotCashForCash = function(transaction) {
    const user1CashToDebit = getCashForUserInTransaction('user1Items', transaction);
    const user2CashToDebit = getCashForUserInTransaction('user2Items', transaction);
    const isBad = !!user1CashToDebit && !!user2CashToDebit;
    if (isBad) {
      throw new Meteor.Error('CASH_FOR_CASH', 'Cannot have cash on both sides of a trade');
    }
  };

  function checkIfValidTransaction(transaction) {
    checkThatNotCashForCash(transaction);
    checkIfBothUsersHaveSufficientFunds(transaction);
    checkIfBothUsersHaveItems(transaction);
  }

  return {
    removeItemsInTransaction: function(transaction) {
      DB.listings.cancelListingsForItems(transaction.user1Items);
      DB.listings.cancelListingsForItems(transaction.user2Items);

      DB.cancelRealTimeTradeForItems(transaction.user1Items);
      DB.cancelRealTimeTradeForItems(transaction.user2Items);
    },

    executeTrade: function(transaction) {
      checkIfValidTransaction(transaction);

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
      if(sumPreviousDeposits >= Config.financial.maxAddAmount) {
        return false;
      } else {
        return true;
      }
    },

    test: function() {
      const transaction = Transactions.findOne('TWPqRnPonaWbyhWds');
      checkIfValidTransaction(transaction);
    },
  };
})();
