Meteor.publish('chatrooms', function() {
  return ChatRooms.find();
});

Meteor.publish('messages', function(channel) {
  check(channel, String);
  return Messages.find({channel: channel});
});

Meteor.publish('channels', function() {
  return Channels.find({$or: [
    {publishedToUsers: {$in: [this.userId]}}, 
    {publishedToUsers: {$in: ['Public']}}
    ]
  });
});

Meteor.publish('inventoryItems', function() {
  return InventoryItems.find({userId: this.userId});
});

//TODO: ensure index right below each publication. See differential blog
//on that.

Meteor.publish('marketItems', function(){
  return InventoryItems.find({}, {$fields: {userId: 0, 
                             botId: 0, 
                             currentTransactions: 0,
                             deleteInd: 0
  }});
});

Meteor.publish('listings', function() {
  return Listings.find();
});
