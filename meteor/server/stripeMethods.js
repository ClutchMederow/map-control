var Future = Npm.require('fibers/future');

Meteor.methods({
  addPaymentMethodToCustomer: function(customer) {
    check(customer, {
      name: String,
      token: String,
      emailAddress: String
      //TODO: payment methods
    });

    var user = Meteor.users.findOne(this.userId);
    var newCustomer = new Future();

    Meteor.call('stripeCreateCustomer', customer.token, customer.emailAddress, 
      function(error, stripeCustomer){
        if(error) {
          console.log(error);
        } else {
          var customerId = stripeCustomer.id;
          var customerObject = {
            customer: customer,
            payment: {
              card: {
                type: stripeCustomer.sources.data[0].brand,
                lastFour: stripeCustomer.sources.data[0].last4
              }
            }
          };
          Meteor.users.update(user._id, {
            $set: customerObject 
          }, function(error, response) {
            if(error) {
              console.log(error);
            } else {
              newCustomer.return(user);
            }
          });
        }
      });

      return newCustomer.wait();
  },
  addBankAccountToCustomer: function(bankAccount) {
    check(bankAccount, {
      name: String,
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
    //user has existing account
    if(user.account) {
      //TODO 
    } else { //this is first account
      
      Meteor.call('stripeCreateAccount', true, bankAccount.country, email, 
                  function(){});
    }
  }
});
