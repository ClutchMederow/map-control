Meteor.methods({
  'createCheckout': function(amount, currency) {
    check(amount, String);
    check(currency, String);
    return Coinbase.createCheckout(amount, currency, "IronBucks");
  },
  //TODO: do NOT have amount sent by client side, make sure
  //we verify values, etc.
  'sendMoney': function(recipient, amount, currency, description) {
    check(recipient, String);
    check(amount, String);
    check(currency, String);
    check(description, String);
    return Coinbase.sendMoney(recipient, amount, currency, description);
  },
  getCurrencies: function() {
    return Coinbase.getCurrencies();
  }
});
