Template.stripePayment.onRendered(function() {
  handler = StripeCheckout.configure({
    key: 'pk_test_Jh9FqP8XBplVxIQFnYnewN5W',
    token: function(token) {
      Meteor.call('chargeCard', token, function(error) {
        if(error) {
          console.log(error.reason);
        } else {
          console.log('Success!');
        }
      });
    }
  });
});

Template.payment.events({
  'click #customButton': function(e) {
    e.preventDefault();
    handler.open({
      name: 'Demo Site',
      description: '2 widgets',
      amount: 2000
    });
  }
});
