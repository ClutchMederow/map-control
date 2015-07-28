Template.memberHomePage.helpers({
  getMarket: function() {
    return {userId: 'All'};
  },
  getMyListings: function() {
    return {userId: Meteor.userId()};
  }
});
