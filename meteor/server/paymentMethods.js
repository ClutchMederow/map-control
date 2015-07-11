Meteor.methods({
  chargeCard: function(stripeToken) {
    var Stripe = StripeAPI('sk_test_YIOpjzq5R1kgUZrArappzd9X');
    //TODO: lookup customer to see if they exist,
    //if they don't store customer token
    Stripe.charges.create({
      amount: 400,
      currency: 'usd',
      source: stripeToken.id,
      description: 'Charging for Trade'
    }, function(error, charge){
      console.log(charge);
    });
  }
});
