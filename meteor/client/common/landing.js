Template.landing.events({
  'click #steamLogin': function(e) {
    Meteor.loginWithSteam(function(error, data) {
      if(error) {
        console.log(error.reason);
      } else {
        Router.go('home');
      }
    });
  }
});
