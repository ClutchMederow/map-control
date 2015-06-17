DB = {
  insertChat: function(attributes) {
    Messages.insert({
      userId: attributes.userId,
      channel: attributes.channel,
      text: attributes.text
    });
  }
};
