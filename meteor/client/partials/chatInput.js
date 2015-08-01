Template.chatInput.events({
  'click #post': function(e) {
    console.log(this);
    e.preventDefault();
    var attributes = {
      channel: Session.get('channel'),
      text: $("#chat_message").val()
    };
    Meteor.call('insertChat',attributes, function(error){
      if(error) {
        console.log('Error');
      } else {
        $('#chat_message').val("");
      }
    });
  }
});
