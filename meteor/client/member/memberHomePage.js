Template.home.onRendered(function() {
});

Template.home.helpers({
  getMarket: function() {
    return {userId: 'All'};
  },
  getMyListings: function() {
    return {userId: Meteor.userId()};
  },
  getMyTransactions: function() {
    return {userId: Meteor.userId()};
  },
  firstTimeLoggingIn: function() {
    if(Meteor.user()) {
      return Meteor.user().profile.firstLoggedIn;
    }
  }
});
