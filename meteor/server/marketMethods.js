Meteor.methods({
  createListing: function(tradeItems, marketItems) {
    check(tradeItems, [Object]);
    check(marketItems, [Object]);
    var user = Meteor.users.findOne(this.userId);
    DB.listings.addListing(user,tradeItems, marketItems);
  },

  removeListing: function(listingId) {
    check(listingId, String);
    DB.removeListing(listingId);
  },

  createOffer: function(listingId, offeredItems) {
    check(listingId, String);
    check(offeredItems, [Object]);

    //ensure that user in their inventory requested items
    var listing = Listings.findOne(listingId);
    var itemsInInventory = MarketHelper.checkInventoryForItems(this.userId,
     listing.request);
    if(itemsInInventory) {
      DB.addOffer(this.userId, listing, offeredItems);
    } else {
      throw new Meteor.Error("missing inventory items",
        "You don't have one of the requested items in your stash");
    }
  },

  cancelTrade: function(transactionId) {
    check(transactionId, String);
    Transactions.changeStage(transactionId, Enums.TransStage.CANCELED);
  }
});
