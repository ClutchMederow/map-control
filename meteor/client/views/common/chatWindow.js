function channelsCursor() {
    return Channels.find();
}

Template.chatWindow.onCreated(function() {
  //TODO: add this to config object
  Session.set('channel', 'Trading Floor');

  var self = this;
  self.autorun(function() {
    self.subscribe('messages', Session.get('channel'));
  });
});

Template.chatWindow.onRendered(function() {
  //this is necessary to get materialize collapsible to work
  //with meteor. Basically need to ensure DOM renders
  this.autorun(function() {
    Tracker.afterFlush(function() {
      var channelsCount = channelsCursor().count();
      //Note: need to use above variable to make
      //sure tracker reruns
      console.log(channelsCount);
      this.$('.collapsible').collapsible({
        accordion : false
      });
    }.bind(this));
  }.bind(this));
});

Template.chatWindow.helpers({
  messages: function() {
    return Messages.find({'channel.name': Session.get('channel')});
  },
  channels: function() {
    return Channels.find();
  },
  channelsByCategory: function() {
    var channels = channelsCursor().fetch();
    return _.groupBy(channels, function(channel) {
      return channel.category;
    });
  }
});

Template.chatWindow.events({
  'click .channel': function(e) {
    Session.set('channel', this.name);
  }
});
