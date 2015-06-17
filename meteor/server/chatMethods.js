Meteor.methods({
  insertChat: function(attributes) {
    console.log(attributes);
    check(attributes, {
      text: String,
      channel: String
    });
    attributes.userId = this.userId;
    DB.insertChat(attributes);
  }
});
