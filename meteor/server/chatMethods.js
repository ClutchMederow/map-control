Meteor.methods({
  test: function(attributes) {
    check(attributes, {
      text: String,
      channel: String
    });

    this.userId = 'oj75Az7ifWnRxLGep';

    var user = Users.findOne(this.userId);

    //TODO: make this cleaner, risky to rely on names
    var channel = Channels.findOne({ name: attributes.channel });
    var items = Chat.parseChatText(attributes.text);

    attributes.items = items;
    attributes.channel = channel;
    attributes.user = {userId: this.userId, profile: user.profile};

    if (channel.category === 'Private') {
      DB.insertPrivateChat(attributes);
    } else {
      DB.insertChat(attributes);
    }
  },

  insertChat: function(attributes) {
    check(attributes, {
      text: String,
      channel: String
    });

    var user = Users.findOne(this.userId);

    //TODO: make this cleaner, risky to rely on names
    var channel = Channels.findOne({ name: attributes.channel });
    var items = Chat.parseChatText(attributes.text);

    attributes.items = items;
    attributes.channel = channel;
    attributes.user = {userId: this.userId, profile: user.profile};

    if (channel.category === 'Private') {
      DB.insertPrivateChat(attributes);
    } else {
      DB.insertChat(attributes);
    }
  },

  startPrivateChat: function(otherUserId) {
    check(otherUserId, String);
    DB.startChat(this.userId, otherUserId,Enums.ChatType.CHAT);
  },

  updateUnseen: function(channelId) {
    DB.updateUnseen(channelId, this.userId);
  }
});
