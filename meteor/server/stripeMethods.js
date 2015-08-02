var Future = Npm.require('fibers/future');

Meteor.methods({
  addPaymentMethodToCustomer: function(customer) {
    check(customer, {
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
          var subscription = {
            customerId: customer,
            payment: {
              card: {
                type: stripeCustomer.sources.data[0].brand,
                lastFour: stripeCustomer.sources.data[0].last4
              }
            }
          };
          Meteor.users.update(user._id, {
            $set: subscription 
          }, function(error, response) {
            if(error) {
              console.log(error);
            } else {
              newCustomer.return();
            }
          });
        }
      });

      return newCustomer.wait();
  }
});
