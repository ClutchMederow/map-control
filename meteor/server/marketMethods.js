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
  },
  createOffer: function(listingId) {
    check(listingId, String);
    //ensure that user in their inventory requested items
    var listing = Listings.findOne(listingId);
    var itemsInInventory = MarketHelper.checkInventoryForItems(this.userId, 
     listing.request);
    if(itemsInInventory) {
      DB.addOffer(this.userId, listing);
    } else {
      throw new Meteor.Error("missing inventory items", 
                             "You don't have one of the requested items in your stash");
    }
  },
  cancelTrade: function(transactionId) {
    check(transactionId, String);
    DB.removeTrade(transactionId);
  }
});