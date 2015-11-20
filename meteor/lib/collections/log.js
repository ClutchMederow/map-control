Logs = new Mongo.Collection('log');

//logs should have:
//[userId], date, type (credit, debit, trade, audit)
//[items], amount
//everything stored in USD

//TODO: add index to logs?


checkWithdrawal = function(userId) {
  var sumDebits = 0;
  var sumCredits = 0;
  var sumIronBucks = Meteor.users.findOne(userId).profile.ironBucks;
  var sumSales = 0;
  var sumBuys = 0;
  var sumFees = 0;

  var selector = {};

  if(userId) {
    selector.userId = userId;
  }
 
  Logs.find(selector).forEach(function(log) {
    if(log.type === Enums.LogType.CREDIT) {
      sumCredits = sumCredits + log.amount;
    }

    if(log.type === Enums.LogType.DEBIT) {
      sumDebits = sumDebits + log.amount;
    }

    if(log.type === Enums.LogType.SALE) {
      sumSales = sumSales + log.amount;
    }
    
    if(log.type === Enums.LogType.BUY) {
      sumBuys = sumBuys + log.amount;
    }

    if(log.type === Enums.LogType.FEE) {
      sumFees = sumFees + log.amount;
    }
  });

  return {
    sumDebits: sumDebits,
    sumCredits: sumCredits,
    sumSales: sumSales,
    sumBuys: sumBuys,
    sumFees: sumFees,
    sumIronBucks: sumIronBucks,
    total: (sumDebits + sumCredits + sumSales + sumBuys + sumFees + sumIronBucks),
    userId: userId
  };
};
