Template.home.helpers({
  getMarket: function() {
    return {userId: 'All'};
  },
  getMyListings: function() {
    return {userId: Meteor.userId()};
  },
  getMyTransactions: function() {
    return {userId: Meteor.userId()};
  }
});

Template.home.events({
  'click .post-item': function(e) {
    e.preventDefault();
    Session.set('listing', true);
  }
});