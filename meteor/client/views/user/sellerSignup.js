Template.sellerSignup.events({

});

Template.sellerSignup.helpers({
  clientId: function() {
    return Meteor.settings.public.stripe.devClientId;
  }
});
