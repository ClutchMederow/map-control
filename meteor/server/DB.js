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
  },
  insertRealTimeTrade: function(user1Id, user2Id) {
    RealTimeTrade.insert({
      user1Id: user1Id,
      user2Id: user2Id,
      user1Stage: "INVITED",
      user2Stage: "INVITED"
    });
  },
  acceptRealTimeTrade: function(tradeId) {
    RealTimeTrade.update(tradeId, {$set: {user1Stage: "TRADING", user2Stage: "TRADING"}});
  },
  rejectRealTimeTrade: function(tradeId) {
    RealTimeTrade.update(tradeId, {$set: {user2Stage: "REJECTED", closeDate: new Date()}});
  },
  addItemToTrade: function(item, tradeId, field) {
    //TODO: for some reason when I use field directly in the push
    //statement below I get a simple schema validation error...
    //this is a little more verbose, but cleaner I suppose
    if(field === "user1Items") {
      RealTimeTrade.update(tradeId, {$push: {user1Items: item}});
    } else if (field === "user2Items") {
      RealTimeTrade.update(tradeId, {$push: {user2Items: item}});
    } else {
      throw new Meteor.Error("INCORRECT_FIELD", "Only item fields allowed");
    }
  },
  removeItemFromTrade: function(item, tradeId, field) {
    if(field === "user1Items") {
      RealTimeTrade.update(tradeId, {$pull: {user1Items: item}});
    } else if (field === "user2Items") {
      RealTimeTrade.update(tradeId, {$pull: {user2Items: item}});
    } else {
      throw new Meteor.Error("INCORRECT_FIELD", "Only item fields allowed");
    }
  },
  setTradeStage: function(tradeId, field, stage) {
    if(field === "user1Stage") {
      RealTimeTrade.update(tradeId, {$set: {user1Stage: stage}});
    } else if (field === "user2Stage") {
      RealTimeTrade.update(tradeId, {$set: {user2Stage: stage}});
    } else {
      throw new Meteor.Error("INCORRECT_FIELD", "Only stage fields allowed");
    }
  },
  checkForTradeCompletion: function(tradeId) {
    var trade = RealTimeTrade.findOne(tradeId);
    if(trade.user1Stage === "CONFIRMED" && trade.user2Stage == "CONFIRMED") {
      //TODO: execute trade
      //Transactions.insert...
      //Dispatcher
    }
  }
};
