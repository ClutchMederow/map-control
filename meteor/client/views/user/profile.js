Template.profile.helpers({
  goodToGo: function() {
    if (Meteor.user() && Meteor.user().profile) {
      return !!Meteor.user().profile.email && !!Meteor.user().profile.tradeURL;
    } else {
      return false;
    }
  }
});