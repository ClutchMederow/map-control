var Future = Npm.require('fibers/future');

Meteor.methods({
  addPaymentMethodToCustomer: function(customer) {
    check(customer, {
      name: String,
      token: String,
      emailAddress: String
    });

    var user = Meteor.users.findOne(this.userId);
    if(user.customer) {
      //TODO: update user with additional card using Stripe API
    } else {
      var newCustomer = new Future();
      Meteor.call('stripeCreateCustomer', customer.token, customer.emailAddress, 
                  function(error, stripeCustomer){
                    if(error) {
                      console.log(error);
                    } else {
                      var payment = {
                        customerId: stripeCustomer.id,
                        card: {
                          brand: stripeCustomer.sources.data[0].brand,
                          lastFour: stripeCustomer.sources.data[0].last4
                        }
                      };
                      Meteor.users.update(user._id, {
                        $set: {
                          stripeCustomer: payment,
                          "profile.emailAddress": customer.emailAddress,
                          "profile.fullName": customer.name 
                        }},
                        function(error, response) {
                          if(error) {
                            console.log(error);
                          } else {
                            newCustomer.return(user);
                          }
                        });
                    }
                  });
                  return newCustomer.wait();
    }
  },
  addBankAccountToCustomer: function(bankAccount) {
    check(bankAccount, {
      street1: String,
      street2: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      last4: String,
      token: String
    });

    var user = Meteor.users.findOne(this.userId);
    var newAccount = new Future(); 
    //user has existing account
    /*
    if(user.account) {
      //TODO 
    } else { //this is first account
   */
      console.log("Creating account");
      Meteor.call('stripeCreateAccount', true, bankAccount.country, 
                  user.profile.emailAddress, function(error, stripeAccount){
                    //update account, then update user object in meteor
                    if(error) {
                      console.log(error);
                    } else {
                      var account = {
                        accountId: stripeAccount.id
                      };
                      //initially update account in meteor
                      Meteor.users.update(user._id, {$set: {account: account }});
                      
                      //then update account details in stripe
                      Meteor.call('stripeUpdateAccount', stripeAccount.id, 
                                  bankAccount,
                                  function(error, stripeAccountDetails) {
                                    if(error) {
                                      console.log(error);
                                    } else {
                                      console.log(stripeAccountDetails);
                                    }
                                  });
                    }
                  });
      return newAccount.wait();
    }
  //}
});
