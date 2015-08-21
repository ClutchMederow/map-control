Template.chatInput.events({
  'click #post': function(e) {
    e.preventDefault();

    var attributes = {
      channel: Session.get('channel'),
      text: $("#chat_message").val()
    };

    if (!attributes.text) return;

    Meteor.call('insertChat',attributes, function(error){
      if(error) {
        console.log('Error');
      } else {
        $('#chat_message').val("");
      }
    });
  }
});
