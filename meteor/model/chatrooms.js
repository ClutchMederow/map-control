ChatRooms = new Meteor.Collection('chatrooms');

ChatRooms.attachSchema(new SimpleSchema({
  userIds: {
    type: [String],
    label: 'users in chat room',
    optional: true
  },
  chats: {
    type: [Object], //[{userId, username, chat string}
    label: 'chat objects',
    optional: true
  }
}));

ChatRooms.allow({
  insert: function() {
    return true;
  }, 
  update: function() {
    return true;
  },
  remove: function() {
    return true;
  }
});
