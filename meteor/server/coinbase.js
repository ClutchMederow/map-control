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
    //add in our fee to total
    var totalAmount = withdrawalAmount + (withdrawalAmount * Config.financial.fee);
    
    //check to make sure they have enough to withdraw including our fee
    if(totalAmount <= user.ironBucks) {
      //TODO: consider order of operations here...
      DB.updateIronBucks(user._id, -totalAmount);
      var roundedAmount = roundCurrency(withdrawalAmount);
      Coinbase.sendMoney(user.profile.email, roundedAmount, "USD", 
                         "withdrawing Iron Bucks");
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
