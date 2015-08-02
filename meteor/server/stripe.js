var secret = Meteor.settings.private.stripe.testSecretKey;
var Stripe = StripeAPI(secret);
var Future = Npm.require('fibers/future');
var Fiber  = Npm.require('fibers');


Meteor.methods({
  stripeCreateCustomer: function(token, email){
    check(token, String);
    check(email, String);
    var stripeCustomer = new Future();

    Stripe.customers.create({
      source: token,
      email: email
    }, function(error, customer){
      if (error){
        stripeCustomer.return(error);
      } else {
        stripeCustomer.return(customer);
      }
    });

    return stripeCustomer.wait();
  } 
});
