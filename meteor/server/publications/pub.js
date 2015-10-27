Meteor.publish('chatrooms', function() {
  return ChatRooms.find();
});

Meteor.publish('messages', function(channel) {
  check(channel, String);
  return Messages.find({'channel.name': channel});
});

Messages._ensureIndex({"channel.name": 1});

Meteor.publish('channels', function() {
  return Channels.find({ $or: [
      {
        publishedToUsers: { $in: [this.userId] },
        show: this.userId
      },
      { publishedToUsers: { $in: ['Public'] }}
    ]
  });
});

Channels._ensureIndex({"publishedToUsers": 1});

Meteor.publish('items', function() {
  return Items.find({ userId: this.userId, deleteInd: false }, { fields: { botName: 0 }});
});

Items._ensureIndex({"userId": 1});

Meteor.publish('marketItems', function(){
  return Items.find({}, {$fields: {userId: 0,
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

RealTimeTrade._ensureIndex({"user1Id": 1});
RealTimeTrade._ensureIndex({"user2Id": 1});

Meteor.publish('userPresence', function() {
  //Note: this only shows status for logged in users
  var filter = {userId: {$exists: true}};

  return Presences.find(filter, {fields: {state: true, userId: true}});
});

//TODO: indices for presences?
Presences._ensureIndex({"userId": 1});

Meteor.publish('userData', function () {
  if (this.userId) {
    return Meteor.users.find({ _id: this.userId}, { fields: { 'services.steam': 1 }});
  } else {
    this.ready();
  }
});

Meteor.publish('genericItems', function() {
  return GenericItems.find();
});

Meteor.publish('notifications', function() {
  return Notifications.find({userId: this.userId});
});

Notifications._ensureIndex({"userId": 1});
