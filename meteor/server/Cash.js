Cash = function() {
  this.stripe = StripeAPI('sk_test_YIOpjzq5R1kgUZrArappzd9X');
};

Cash.prototype.chargeCard = function(stripeToken) {
  //TODO: lookup customer to see if they exist,
  //if they don't store customer token
  var charge = Meteor.wrapAsync(stripe.charges.create);
  var options = {
    amount: 400,
    currency: 'usd',
    source: stripeToken.id,
    description: 'Charging for Trade'
  };

  try {
    return charge(options);
  } catch(e) {
    console.log(e);
  }
};
