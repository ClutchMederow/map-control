Template.chatInput.events({
  'click #post': function(e) {
    e.preventDefault();

    var attributes = {
      channel: Iron.controller().getParams().channel,
      text: $("#chat_message").text().trim()
    };

    Meteor.call('insertChat',attributes, function(error){
      if(error) {
        throw error;
      } else {
        $('#chat_message').text("");
      }

      $('#chat_message').focus();
    });
  },

  'click .chat-box img': function(e) {
    selectedChatItems.remove(e.target.id);
  },

  'keydown #chat_message': function(e) {
    if(e.keyCode == 13) {
      e.preventDefault();
      $('#post').click();
    }
  },

  'click .sign-up-trigger': function(e) {
    e.preventDefault();
    $('#signup-modal').openModal();
  },
});

Template.chatInput.helpers({
  isDisabled: function() {
    return !Meteor.user() ? 'disabled' : '';
  },
});