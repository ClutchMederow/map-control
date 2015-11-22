Meteor.methods({
  'createCheckout': function(amount) {
    check(amount, String);
    //TODO: make this Enum
    var currency = "USD";
    var user = Meteor.users.findOne(this.userId);
    var tradeHelper = TradeHelper;
    var approvedForDeposit = tradeHelper.checkDeposit(this.userId);
    if(approvedForDeposit) {
      var roundedAmount = parseFloat(amount).toFixed(2);
      return Coinbase.createCheckout(roundedAmount, currency, user.profile.email);
    } else {
      throw new Meteor.Error(Enums.MeteorError.EXCEEDED_DEPOSIT_RATE, 
                            "You have deposited too much too quickly. " + 
                            "Please wait a day or contact customer service");
    }
  },
  //TODO: rename this to withdrawMoney
  'sendMoney': function(amount) {
    check(amount, String);
    var currency = "USD";

    var user = Meteor.users.findOne(this.userId);
    //convert to USD, aka IronBucks

    var tradeHelper = TradeHelper;
    var approvedForWithdrawal = tradeHelper.checkWithdrawal(this.userId);
    var withdrawalAmount = parseFloat(amount) / currValue(currency);
    
    //check to make sure they have enough to withdraw including our fee
    if(approvedForWithdrawal && withdrawalAmount <= user.ironBucks) {

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

        sendTotalErrorEmail(logId, withdrawalObject, this.userId);
        throw new Meteor.Error("INCORRECT_WITHDRAWAL", "transactions do not match");
      }
    } else {
      if(approvedForWithdrawal) {
        throw new Meteor.Error(Enums.MeteorError.INSUFFICIENT_FUNDS, 'not enough cash');
      } else {
        throw new Meteor.Error(Enums.MeteorError.EXCEEDED_WITHDRAWAL_RATE, 
                               'You have withdrawn too much cash. Please wait a day ' + 
                              'or contact customer support');
      }
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
