Meteor.publish('chatrooms', function() {
  return ChatRooms.find();
});
//Testing vim marks
