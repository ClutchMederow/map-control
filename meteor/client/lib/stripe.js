Meteor.startup(function() {
  var stripeKey = Meteor.settings.public.stripe.testPublishableKey;
  Stripe.setPublishableKey(stripeKey);
});

STRIPE = {
  getToken: function( domElement, card, callback ) {
    Stripe.card.createToken( card, function( status, response ) {
      if ( response.error ) {
        console.log(response.error.message);
      } else {
        STRIPE.setToken( response.id, domElement, callback );
      }
    });
  },
  setToken: function( token, domElement, callback ) {
    $( domElement ).append( $( "<input type='hidden' name='stripeToken' />" ).val( token ) );
    callback();
  }
};
