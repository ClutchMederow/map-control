Meteor.methods({
  'createCheckout': function(amount, currency) {
    check(amount, String);
    check(currency, String);
    var user = Meteor.users.findOne(this.userId);
    return Coinbase.createCheckout(amount, currency, user.profile.email);
  },
  'sendMoney': function(amount, currency) {
    check(amount, String);
    check(currency, String);

    var user = Meteor.users.findOne(this.userId);
    //convert to USD, aka IronBucks
    var withdrawalAmount = parseFloat(amount) / currValue(currency);
    
    //check to make sure they have enough to withdraw including our fee
    if(withdrawalAmount <= user.ironBucks) {

      var withdrawalObject = checkWithdrawal(this.userId);
      var logData = withdrawalObject;
      logData.date = new Date();

      if(withdrawalObject.total === 0) {

        logData.type = Enums.LogType.AUDIT;
        Logs.insert(logData);

        DB.updateIronBucks(user._id, -withdrawalAmount);

        var roundedAmount = roundCurrency(withdrawalAmount);
        Coinbase.sendMoney(user.profile.email, roundedAmount, "USD", 
                           "withdrawing Iron Bucks");
      } else {
        logData.type = Enums.LogType.ERROR;

        var logId = Logs.insert(logData);

        sendTotalErrorEmail(logId, withdrawalObject, userId);
        throw new Meteor.Error("INCORRECT_WITHDRAWAL", "transactions do not match");
      }
    } else {
      throw new Meteor.Error('insufficient_funds', 'not enough IronBucks');
    }


    return withdrawalAmount;
  },
  getCurrencies: function() {
    return Coinbase.getCurrencies();
  },
  getIronBucks: function() {
    return Meteor.users.findOne(this.userId).ironBucks;
  }
  
});
