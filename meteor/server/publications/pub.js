Meteor.publish('chatrooms', function() {
  return ChatRooms.find();
});
