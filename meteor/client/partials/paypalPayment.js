var paypalConfigAlert = {
  timeout: 0,
  html: true,
  onRouteClose: false
};

Template.paypalPayment.events({
  'click #pay': function(e) {
    var currency = "USD",
        total = "1.00",
        payment = {
          "intent": "sale",
          "payer": {
            "payment_method": "paypal"
          },
          "redirect_urls": {
            "return_url": "http://localhost:3000/paypalRedirect",
            "cancel_url": "http://localhost:3000"
          }, 
          "transactions": [{
            "amount": {
              "total": total,
              "currency": currency
            },
            "description": "IronBucks payment"
          }]
        };

    Meteor.call('createPayment', payment, function(error, data) {
      if(error) {
        console.log(error);
      } else {
        Session.set('paymentId', data.paymentId);
        var message = "<a href='" + data.redirectUrl + "' target='_blank'>Click here to login to paypal and pay</a>";
        sAlert.success(message, paypalConfigAlert);
      }
    });
  }
});
