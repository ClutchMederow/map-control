Template.chatWindow.onCreated(function() {
  //TODO: add this to config object
  Session.set('channel', 'Trading Floor');

  var self = this;
  self.autorun(function() {
    self.subscribe('messages', Session.get('channel'));
  });
  
});

Template.chatWindow.helpers({
  messages: function() {
    return Messages.find({channel: Session.get('channel')});
  },
  channels: function() {
    return Channels.find();
  }
});

Template.chatWindow.events({
  'click .channel': function(e) {
    Session.set('channel', this.name);
  }
});
