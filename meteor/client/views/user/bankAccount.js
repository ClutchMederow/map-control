Template.bankAccount.onRendered(function() {
  $('#bankAccount').validate({
    submitHandler: function(){
      STRIPE.getBankAccountToken( '#bankAccount', {
        country: $('[name="country"]').val(),
        currency: $('[data-stripe="currency"]').val(),
        routing_number: $('[data-stripe="routing"]').val(),
        account_number: $('[data-stripe="account"]').val()
      }, function() { //callback function to STRIPE in stripe helper
        var bankAccount = {
          street1: $('[name="street1"]').val(),
          street2: $('[name="street2"]').val(),
          city: $('[name="city"]').val(),
          state: $('[name="state"]').val(),
          zip: $('[name="zip"]').val(),
          country: $('[name="country"]').val(),
          last4: $('[name="last4"]').val(),
          token: $('[name="stripeBankToken"]').val()
        };


        Meteor.call('addBankAccountToCustomer', bankAccount, function(error, response){
          if (error) {
            alert(error.reason);
          } else {
            console.log(response);
            sAlert.success("Added payment option");
          }
        });
      }); //END callback function
    }
  });
});

