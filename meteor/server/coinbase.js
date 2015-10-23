Meteor.methods({
  'createCheckout': function() {
    return Coinbase.createCheckout("0.0001", "BTC", "IronBucks");
  },
  'sendMoney': function(recipient, amount, currency, description) {
    check(recipient, String);
    check(amount, String);
    check(currency, String);
    check(description, String);
    return Coinbase.sendMoney(recipient, amount, currency, description);
  }
});
