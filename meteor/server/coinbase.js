Meteor.methods({
  'createCheckout': function() {
    return Coinbase.createCheckout("0.0001", "BTC", "IronBucks");
  }
});
