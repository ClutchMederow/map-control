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
  },
  stripeCreateAccount: function(managed, country, email) {
    check(managed, Boolean);
    check(country, String);
    check(email, String);
    var stripeAccount = new Future();

    //check country code is 2 letters
    var isTwoLetters = Match.Where(function(x) {
      check(x, String);
      return x.length === 2;
    });
    check(country, isTwoLetters);
    
    Stripe.accounts.create({
      country: country,
      managed: managed,
      email: email
    }, function(error, account) {
      if (error){
        stripeAccount.return(error);
      } else {
        console.log("checking account");
        stripeAccount.return(account);
      }
    });
    return stripeAccount.wait();
  },
  stripeUpdateAccount: function(accountId, bankAccount) {
    check(accountId, String);
    check(bankAccount, Object);
    console.log("updating account");
    console.log(bankAccount);
    var updateAccount = new Future(); 

    Stripe.accounts.update({
      external_acccount: bankAccount.token,
      legal_entity: {
        type: "individual",
        personal_address: {
          line1: bankAccount.street1,
          line2: bankAccount.street2,
          city: bankAccount.city,
          state: bankAccount.state,
          postal_code: bankAccount.zip,
          country: bankAccount.country
        }
      }
    }, function(error, account) {
      if(error){
        updateAccount.return(error);
      } else {
        console.log(account);
        updateAccount.return(account);
      }
    });
    return updateAccount.wait();
  },
  stripeCreateAdditionalBankAccount: function() {
    
  }
});
