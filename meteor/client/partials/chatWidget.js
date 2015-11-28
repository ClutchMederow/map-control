Template.chatWidget.helpers({
  chatChannels: function() {
    var otherUserInTrade = getOtherUserId();

    var selector = {
      category: 'Private',
      show: Meteor.userId(),
    };

    if (otherUserInTrade) {
      selector.publishedToUsers = { $ne: otherUserInTrade };
    }

    return Channels.find(selector, {
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

// if currently involved in a trade, return the other user's id
function getOtherUserId() {
  var currentTrade = Session.get('realTime');

  if (currentTrade) {
    var myId = Meteor.userId();

    if (currentTrade.user1Id === myId) {
      return currentTrade.user2Id;
    } else if (currentTrade.user2Id === myId) {
      return currentTrade.user1Id;
    }
  }
}
