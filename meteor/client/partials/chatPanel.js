Template.chatPanel.onCreated(function() {
  var self = this;

  self.autorun(function() {
    self.subscribe('messages', self.data.name);
  });
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
    var presence = Presences.findOne({userId: otherUser.userId});
    return presence ? presence.state : "offline";
  },

  test: function() {
    console.log(this);
  }
});

function getOtherUser(users) {
  var thisUser = Meteor.user().profile.name;

  var otherUser = _.find(users, function(user) {
    return (user.name !== thisUser);
  });
  return otherUser || 'unknown';
}
