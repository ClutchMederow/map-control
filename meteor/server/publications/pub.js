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

Meteor.publish('marketItems', function(){
  return InventoryItems.find({}, {$fields: {userId: 0, 
                             botId: 0, 
                             currentTransactions: 0,
                             deleteInd: 0
  }});
});
