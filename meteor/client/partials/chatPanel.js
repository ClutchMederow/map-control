Template.chatPanel.onCreated(function() {
  var self = this;

  self.autorun(function() {
    self.subscribe('messages', self.data.name);
  });
});

Template.chatPanel.onRendered(function() {
  var self = this;

  console.log($('#' + self.data._id + ' .chat-display-box'));

  // Adds a scroll handle to run when a new message arrives
  this.changesHandle = Messages.find({'channel.name': self.name }).observeChanges({
    added: _.throttle(function() {
      console.log(self);
      $('.chatTextWindow').animate({
        scrollTop: $('#' + self.data._id + ' .chat-display-box').get(0).scrollHeight
      }, 500);
    }, 500)
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

  textWithImages: function() {
    return Spacebars.SafeString(Chat.insertImagesForDisplay(this));
  }
});

Template.chatPanel.events({
  'submit .chat-inp-form': function(e) {
    e.preventDefault();

    var $inputElem = $(e.target).find('input');

    var channelName = this.name;
    var attributes = {
      channel: channelName,
      text: $inputElem.val().trim()
    };

    Meteor.call('insertChat',attributes, function(error){
      if(error) {
        console.log(error);
      } else {
        $inputElem.val('');
      }

      $inputElem.focus();
    });
  }
});

Template.chatPanel.destroyed = function() {
  console.log(this);

  // Need to destroy the handle - it will run infinitely if not explicitly released
  if (this.changesHandle) {
    this.changesHandle.stop();
  }
};

function getOtherUser(users) {
  var thisUser = Meteor.user().profile.name;

  var otherUser = _.find(users, function(user) {
    return (user.name !== thisUser);
  });
  return otherUser || 'unknown';
}

