Paypal = Meteor.npmRequire('paypal-rest-sdk');
Paypal.configure({
  "mode": "live",
  'client_id': Meteor.settings.private.paypal.liveClientId,
  'client_secret': Meteor.settings.private.paypal.liveSecret
});

Meteor.methods({
  'createPayment': function(paymentDetails) {
    //TODO: specify this, could easily be spoofed
    check(paymentDetails, Object);
    var details = Async.runSync(function(done) {
      Paypal.payment.create(paymentDetails, function(error, payment) {
        if(error) {
          console.log(error);
        } else {
          var redirectUrl;
          _.each(payment.links, function(link) {
            if(link.method === 'REDIRECT') {
              redirectUrl = link.href;
            }
          });
          done(null, {"redirectUrl": redirectUrl, "paymentId": payment.id});
        }
      });
    });
    return details.result;
  },
  'executePayment': function(payerId, paymentId) {
    check(payerId, String);
    check(paymentId, String); 

    var details = {"payer_id": payerId };
    var execute = Async.runSync(function(done) {
      Paypal.payment.execute(paymentId, details, function(error, payment) {
        if (error) {
          console.log(error);
        } else {
          console.log(payment);
          done(null, payment);
        }
      });
    });
    return execute.result;
  }
});
