Template.chatPanel.onCreated(function() {
  var self = this;

  self.autorun(function() {
    self.subscribe('messages', self.data.name);
  });
});

Template.chatPanel.onRendered(function() {
  var self = this;

  // Adds a scroll handle to run when a new message arrives
  this.changesHandle = Messages.find({'channel.name': self.data.name }).observeChanges({
    added: _.throttle(function() {
      ChatFunctions.updateUnseen(self.data._id);
      ChatFunctions.scrollToBottom(self.data._id);
    }, 500)
  });

  // Initially scroll all windows to bottom
  ChatFunctions.scrollToBottom(self.data._id);
});

Template.chatPanel.helpers({
  messages: function() {
    return Messages.find({'channel.name': this.name }, { sort: { datePosted: 1 } });
  },

  otherUser: function() {
    return getOtherUser(this.users);
  },

  status: function() {
    var otherUser = getOtherUser(this.users);
    var presence = Presences.findOne({ userId: otherUser.userId });
    return presence ? presence.state : "offline";
  },

  textWithImages: function() {
    return Spacebars.SafeString(Chat.insertImagesForDisplay(this));
  },

  unseenCount: function() {
    var userData = _.findWhere(this.users, { userId: Meteor.userId() });
    return !!userData ? userData.unseen : 0;
  },

  unreadMessages: function() {
    var userData = _.findWhere(this.users, { userId: Meteor.userId() });
    if (userData) {
      console.log(userData.unseen);
      return !!userData.unseen ? 'new-messages' : ''
    }
  }
});

Template.chatPanel.destroyed = function() {

  // Need to destroy the handle - it will run infinitely if not explicitly released
  if (this.changesHandle) {
    this.changesHandle.stop();
  }
};

function getOtherUser(users) {
  var thisUser = Meteor.user();

  var otherUser = _.find(users, function(user) {
    return (user.name !== thisUser.profile.name);
  });
  return otherUser || { name: thisUser.profile.name, userId: thisUser._id };
}
