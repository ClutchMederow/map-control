Log = new Mongo.Collection('log');

//logs should have:
//[userId], date, type (credit, debit, trade, audit)
//[items], amount
//everything stored in USD

//TODO: add index to logs?

//need function that takes in userId, determines if debits & credits add up to 0
checkDebitsCredits = function(userId) {
  var sumDebits = 0;
  var sumCredits = 0;

  Logs.find({userId: userId}).forEach(function(log) {
    if(log.type === Enums.LogType.CREDIT) {
      sumCredits = sumCredits + amount;
    }

    if(log.type === Enums.LogType.DEBIT) {
      sumDebits = sumDebits + amount;
    }
  });

  return {
    sumDebits: sumDebits,
    sumCredits: sumCredits,
    difference: (sumDebits + sumCredits)
  };
};
