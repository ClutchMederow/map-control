Template.signup.onRendered(function() {
  //verify signup information here, if we ask for real name, email, etc..
  $('#application-signup').validate({
    submitHandler: function(){
      // We'll handle our actual signup event here.
      STRIPE.getToken( '#application-signup', {
        number: $('[data-stripe="cardNumber"]').val(),
        exp_month: $('[data-stripe="expMo"]').val(),
        exp_year: $('[data-stripe="expYr"]').val(),
        cvc: $('[data-stripe="cvc"]').val()
      }, function() { //callback function to STRIPE in stripe helper
        var customer = {
          //TODO: update what information we collect
          // name: $('[name="fullName"]').val(),
          //emailAddress: $('[name="emailAddress"]').val(),
          //TODO: choose what payment method
          token: $('[name="stripeToken"]').val()
        };

        var submitButton = $('input[type="submit"]').button('loading');

        Meteor.call('addPaymentMethodToCustomer', customer, function(error, response){
          if (error) {
            alert(error.reason);
            submitButton.button('reset');
          } else {
            if ( response.error ) {
              alert(response.message);
              submitButton.button('reset');
            } else {
              salerts.success("Added payment option");
              //TODO: route to home page?, reset button text?
            }
          }
        });
      });
    }
  });
});

Template.signup.helpers({

});

Template.signup.events({

});
