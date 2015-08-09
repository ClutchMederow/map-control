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

Meteor.publish('items', function() {
  return Items.find();
});
