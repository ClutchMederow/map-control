Meteor.methods({
  'createCheckout': function(amount, currency) {
    check(amount, String);
    check(currency, String);
    var user = Meteor.users.findOne(this.userId);
    return Coinbase.createCheckout(amount, currency, user.profile.email);
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
