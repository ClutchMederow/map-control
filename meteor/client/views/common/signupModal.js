Template.signupModal.onCreated(function() {
});

Template.signupModal.events({
  'click #steamLoginModal': function(e, template) {
    e.preventDefault();

    Meteor.loginWithSteam(function(error, data) {
      if(error) {
        sAlert.error(error.reason);
      }
    });
  },

  'click .close-signup-modal': function(e) {
    $('#signup-modal').closeModal();
  },
});