Template.welcomeModal.events({
  'click #agree': function(e) {
    e.preventDefault();
    Meteor.call('finishedWelcomeTour', function(error) {
      if(error) {
        console.log(error.response);
      }
    });
  }
});
