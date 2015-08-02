Meteor.publish('chatrooms', function() {
  return ChatRooms.find();
});

Meteor.publish('messages', function(channel) {
  check(channel, String);
  return Messages.find({'channel.name': channel});
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

Meteor.publish('transactions', function() {
  //TODO: should we limit this by stage?
  return Transactions.find();
});

//Note: do not take in userid here, it can be spoofed
//and is insecure
Meteor.publish('realtimetrade', function() {
  return RealTimeTrade.find({$or: [{user1Id: this.userId}, 
                                   {user2Id: this.userId}
  ]});
});

//TODO: indices on real time trading collection

Meteor.publish('userPresence', function() {
  //Note: this only shows status for logged in users
  var filter = {userId: {$exists: true}};

  return Presences.find(filter, {fields: {state: true, userId: true}});
});

//TODO: indices for presences?
