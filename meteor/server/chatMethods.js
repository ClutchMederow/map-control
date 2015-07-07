Meteor.methods({
  insertChat: function(attributes) {
    console.log(attributes);
    check(attributes, {
      text: String,
      channel: String
    });
    var user = Users.findOne(this.userId);
    attributes.user = {userId: this.userId, profile: user.profile};
    DB.insertChat(attributes);
  },
  startPrivateChat: function(requestorUserId) {
    check(requestorUserId, String);
    var requestor = Users.findOne(requestorUserId);
    var submittor = Users.findOne(this.userId);
    Channels.insert({
      name: requestor.profile.name + '-' + submittor.profile.name,
      publishedToUsers: [requestorUserId, this.userId],
      category: 'Private' 
    });
  }
});
