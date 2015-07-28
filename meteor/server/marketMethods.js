Meteor.methods({
  createListing: function(tradeItems, marketItems) {
    check(tradeItems, [Object]);
    check(marketItems, [Object]);
    var user = Meteor.users.findOne(this.userId);
    DB.addListing(user,tradeItems, marketItems);
  },
  removeListing: function(listingId) {
    check(listingId, String);
    DB.removeListing(listingId);
  }
});
