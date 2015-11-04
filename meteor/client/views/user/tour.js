Template.tour.events({
  'click #tourComplete': function() {
    Meteor.call('setTourComplete', function(err) {
      if(err) {
        Router.go('profile');
      }
    });
  }
});
