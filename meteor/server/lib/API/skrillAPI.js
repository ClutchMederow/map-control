var SkrillAPI = (function() { 
  var paymentsURL = "https://www.moneybookers.com/app/pay.pl";
  var email = Meteor.settings.skrill.merchantEmail;
  var password = Meteor.settings.skrill.md5;

  //Merchant payment means IronFoil sending money to a customer (i.e. cashing
  //out)
  //Customer payment means a customer paying IronFoil
  return {
    prepareMerchantPayment: function(amount, currency, recipientEmail, subject, note) {
      //
      //Need either the sid element or the error element
      var response = HTTP.get(paymentsURL, 
                              {params: {
                                action: "prepare",
                                email: email,
                                password: password,
                                amount: amount,
                                currency: currency,
                                bnf_email: recipientEmail,
                                subject: subject,
                                note: note 
                              }});
      //TODO: parse XML value of response
      if(response.error) {
        throw new Meteor.Error("SKRILL_ERROR", "CRAP");
      } else {
        return response.sid;
      }
    },
    executeMerchantPayment: function(sid) {
      var response = HTTP.get(paymentsURL, 
                              {params: {
                                action: "transfer",
                                sid: sid
                              }});
      //TODO: parse XML value of response
      if(response.error) {
        throw new Meteor.Error("SKRILL_ERROR", "Could not execute payment");
        //TODO: can retry the action if we'd like, because each session will
        //only ever post once
      } else {
        //TODO: log successful cash payments to DB logs
        return response;
      }
    },
    //This is to ensure secure payments (i.e. avoid customers changing payment
    //amounts, etc. See p17 of the Skrill Wallet API at
    //https://www.skrill.com/fileadmin/content/pdf/Skrill_Wallet_Checkout_Guide.pdf
    //for more details)
    prepareCustomerPayment: function(amount, currency, productLabel, productDescription) {
      var paymentURL = "https://pay.skrill.com/";
      var merchantEmail = Meteor.settings.skrill.merchantEmail;
      var customerId = Meteor.settings.customerId;
      var response = HTTP.post(paymentURL, 
                {params: {
                  pay_to_email: merchantEmail,
                  recipient_description: "IronFoil",
                  status_url: "", //TODO: build webhook to do logging and confirm transaction (and chargebacks)
                  language: "EN",
                  prepare_only: 1,
                  detail1_description: productLabel,
                  detail1_text: productDescription
                }});

      //TODO: parse response, handle any error codes, then use the 
      // session_id from the response in the iFrame of the Skrill
      // window client side.
      // https://pay.skrill.com/?sid=<SESSION_ID>
      //TODO: create log entry in DB to await pending payment and double check?
      return response.session_id;
    }
  }
  }) ();
