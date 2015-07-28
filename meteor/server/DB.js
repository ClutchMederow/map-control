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
  }
};
