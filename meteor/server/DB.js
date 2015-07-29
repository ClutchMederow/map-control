DB = {
  insertChat: function(attributes) {
    Messages.insert({
      user: attributes.user,
      channel: attributes.channel,
      text: attributes.text,
      datePosted: new Date()
    });
  },
  removeInventoryItems: function(userId) {
    InventoryItems.remove({userId: userId});
  },
  addListing: function(user,tradeItems, marketItems) {
    var datePosted = new Date(); 
    Listings.insert({
      user: user, 
      items: tradeItems, 
      request: marketItems,
      datePosted: datePosted
    });
  },
  removeListing: function(listingId) {
    Listings.remove({_id: listingId});
    //TODO: send notification to anyone watching this listing, etc.
  },
  addOffer: function(userId, listing) {
    var currentDate = new Date(); 
    Transactions.insert({
      user1Id: listing.user._id,
      user1Items: listing.items,
      user2Id: userId,
      user2Items: listing.request,
      offerDate: currentDate,
      stage: 'INITIAL_OFFER'
    });
    //Note: transaction hook fires to update inventory items
  },
  removeTrade: function(transactionId) {
    //TODO: make this an ENUM
    Transactions.update({_id: transactionId}, {$set: {stage: "CANCELED"}});
  }
};
