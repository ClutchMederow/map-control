Template.chatInput.events({
  'click #post': function(e) {
    var channel = Session.get('channel');
    var message = $("#chat_message").val();
    Meteor.call('insert');
  }
});
