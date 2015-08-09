Meteor.startup(function() {
  var stripeKey = Meteor.settings.public.stripe.testPublishableKey;
  Stripe.setPublishableKey(stripeKey);
});

STRIPE = {
  getCardToken: function( domElement, card, callback ) {
    Stripe.card.createToken( card, function( status, response ) {
      if ( response.error ) {
        console.log(response.error.message);
      } else {
        STRIPE.setCardToken( response.id, domElement, callback );
      }
    });
  },
  setCardToken: function( token, domElement, callback ) {
    $( domElement ).append( $( "<input type='hidden' name='stripeToken' />" ).val( token ) );
    callback();
  },
  getBankAccountToken: function(domElement, bankAccount, callback) {
    console.log(bankAccount);
    check(bankAccount, {
      country: String,
      currency: String,
      routing_number: String,
      account_number: String
    });
    Stripe.bankAccount.createToken({
      country: bankAccount.country,
      currency: bankAccount.currency,
      routing_number: bankAccount.routing_number,
      account_number: bankAccount.account_number
    }, function(error, response) {
      if(response.error) {
        console.log(response.error.message);
      } else {
        STRIPE.setBankAccountToken(response.id, domElement, callback); 
      }
    });
  },
  setBankAccountToken: function(token, domElement, callback) {
    $( domElement ).append( $( "<input type='hidden' name='stripeBankToken' />" ).val( token ) );
    callback();
  }
};
