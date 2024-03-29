Meteor.publish('chatrooms', function() {
  return ChatRooms.find();
});

Meteor.publish('coinbaseCurrencies', function() {
  return CoinbaseCurrencies.find();
});

Meteor.publish('messages', function(channel) {
  check(channel, String);
  return Messages.find({ 'channel.name': channel }, { sort: { datePosted: -1 },  limit: 50 });
});

Messages._ensureIndex({"channel.name": 1});

Meteor.publish('channels', function() {
  return Channels.find({ $or: [
      {
        publishedToUsers: { $in: [ this.userId ] }
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

//Note: safer to check these objects individually then
//build a single composite options object
Meteor.publish('listings', function(selector, searchText, options) {
  check(selector, Object);
  check(searchText, String);
  check(options, Object);

  if(searchText) {
    var searchReg = new RegExp(searchText, 'i');
    selector = _.extend(selector, {$or: [{"items.name": searchReg},
                        {"request.name": searchReg}
    ]});
  }
  return Listings.find(selector, options);
});

Meteor.publish('transactions', function() {
  //TODO: should we limit this by stage?
  return Transactions.find();
});

//Note: do not take in userid here, it can be spoofed
//and is insecure
Meteor.publish('realtimetrade', function() {
  return RealTimeTrade.find({
    $or: [
      { user1Id: this.userId },
      { user2Id: this.userId }
    ],
    $and: [
      { closeDate: null }
    ]
  });
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
  return Notifications.find({ userId: this.userId, deleteInd: { $ne: true }});
});

Notifications._ensureIndex({"userId": 1});
