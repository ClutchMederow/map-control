Template.chatWidget.helpers({
  chatChannels: function() {
    return Channels.find({ category: 'Private'}, { limit: 4 });
  }
});

Template.chatWidget.events({
  'click .chat-label': function(e) {
    e.preventDefault();
    var id = this._id;
    $('#' + id).toggleClass('active-chat');
    $('#' + id).find('input').focus();
  }
});
