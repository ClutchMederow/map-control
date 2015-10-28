ChatFunctions = {
  scrollToBottom: function(id) {
    setTimeout(function() {
      var $thisElem = $('#' + id + ' .chat-display-box');
      $thisElem.scrollTop($thisElem.get(0).scrollHeight);
    }, 0)
  },

  toggleOpen: function(id) {
    $('#' + id).toggleClass('active-chat');
    $('#' + id).find('input').focus();
    this.updateUnseen(id);
  },

  inputMessage: function(target, channelName) {
    var $inputElem = $(target).find('input');

    if (!$inputElem.val().trim()) return;

    var attributes = {
      channel: channelName,
      text: $inputElem.val().trim()
    };

    // clear it first
    $inputElem.val('');

    Meteor.call('insertChat',attributes, function(error){
      if(error) {
        sAlert.error(error.message);
      } else {
      }

      $inputElem.focus();
    });
  },

  hideChat: function(channelId) {
    check(channelId, String);
    Channels.update(channelId, { $pull: { show: Meteor.userId() }});
  },

  showChat: function(channelId) {
    check(channelId, String);
    Channels.update(channelId, { $push: { show: Meteor.userId() }});
  },

  updateUnseen: function(channelId) {
    check(channelId, String);
    if ($('#' + channelId).hasClass('active-chat')) {
      Meteor.call('updateUnseen', channelId);
    }
  }
};