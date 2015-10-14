Paypal = Meteor.npmRequire('paypal-rest-sdk');
Paypal.configure({
  "mode": "sandbox",
  'client_id': Meteor.settings.private.paypal.sandboxClientId,
  'client_secret': Meteor.settings.private.paypal.sandboxSecret
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
  },
  'sendPayment': function() {
    var endpoint = "https://svcs.paypal.com/AdaptivePayments/Pay";
    var result = HTTP.get(endpoint, {
      data: {
        "actionType": "PAY",
        "cancelUrl": "http://google.com",
        "currencyCode": "USD",
        "receiverList.receiver(0).email": "deltaveelabs@gmail.com",
        "receiverList.receiver(0).amount": "1.00",
        "requestEnvelope.errorLanguage": "en_US",
        "returnUrl": "http://google.com",
        "senderEmail": "duncanrenfrow@gmail.com"
      },
      headers: {
        "X-PAYPAL-SECURITY-USERID": Meteor.settings.private.paypal.liveApiUserName,
        "X-PAYPAL-SECURITY-PASSWORD": Meteor.settings.private.paypal.liveApiPassword,
        "X-PAYPAL-SECURITY-SIGNATURE": Meteor.settings.private.paypal.liveSignature,
        "X-PAYPAL-REQUEST-DATA-FORMAT": "NV",
        "X-PAYPAL-RESPONSE-DATA-FORMAT": "NV",
        "X-PAYPAL-APPLICATION-ID": Meteor.settings.private.paypal.liveAppId
      }
    }, function(error, response) {
      if(error) {
        console.log(error);
      } else {
        console.log(response);
      }
    });
  }
});
