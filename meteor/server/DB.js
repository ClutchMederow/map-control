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
  }
};
