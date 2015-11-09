Template.chatWidget.helpers({
  chatChannels: function() {
    return Channels.find({
      category: 'Private',
      show: Meteor.userId(),
      chatType: { $ne: Enums.ChatType.TRADE }
    }, {
      sort: { name: 1 }
    });
  }
});

Template.chatWidget.events({
  'click .chat-label': function(e) {
    e.preventDefault();
    var id = this._id;
    ChatFunctions.toggleOpen(id);
    ChatFunctions.scrollToBottom(id);
  },

  'submit .chat-inp-form': function(e) {
    e.preventDefault();
    ChatFunctions.inputMessage(e.target, this.name);
  },

  'click .close-chat': function(e) {
    e.preventDefault();
    ChatFunctions.hideChat(this._id);
  }
});
