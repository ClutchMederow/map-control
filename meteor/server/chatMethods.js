Meteor.methods({
  insertChat: function(attributes) {
    console.log(attributes);
    check(attributes, {
      text: String,
      channel: String
    });
    var user = Users.findOne(this.userId);
    //TODO: make this cleaner, risky to rely on names
    var channel = Channels.findOne({name: attributes.channel});
    attributes.channel = channel;
    attributes.user = {userId: this.userId, profile: user.profile};
    DB.insertChat(attributes);
  },
  startPrivateChat: function(requestorUserId) {
    check(requestorUserId, String);
    return DB.insertPrivateChannel(requestorUserId, this.userId);
  }
});
