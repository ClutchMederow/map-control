function channelsCursor() {
    return Channels.find();
}

// Collections to store items added to the chat window
var selectedChatItems = new Mongo.Collection(null);

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
      this.$('.collapsible').collapsible({
        accordion : false
      });
    }.bind(this));
  }.bind(this));

  $('.chatWindow').droppable({
    accept: '.draggable-stash-item',
    hoverClass: 'stash-hover',
    drop: function(e, ui) {
      var itemId = $(ui.draggable[0]).data('itemid');
      dropItem(itemId);
    }
  });

  selectedChatItems.remove({});
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
  },

  currentChannel: function() {
    return Session.get('channel');
  },

  selectedChatItems: function() {
    return selectedChatItems.find().fetch();
  }
});

Template.chatWindow.events({
  'click .channel': function(e) {
    Session.set('channel', this.name);
  },

  'click .chat-input-items img': function(e) {
    selectedChatItems.remove(e.target.id);
  }
});


function dropItem(id) {
  var item = Items.findOne(id);
  if (!selectedChatItems.findOne(id)) {
    selectedChatItems.insert(item);
  }
}
