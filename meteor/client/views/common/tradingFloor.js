function channelsCursor() {
    return Channels.find();
}

var changesHandle;

// Collections to store items added to the chat window
// var selectedChatItems = new Mongo.Collection(null);

Template.tradingFloor.onCreated(function() {
  Session.set('channel', Config.tradingFloor.defaultChannel);

  var self = this;
  self.autorun(function() {
    self.subscribe('messages', Session.get('channel'));
  });
});

Template.tradingFloor.onRendered(function() {
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

  // Define the area where we can drop stash items to be inserted into the chat
  $('.tradingFloor').droppable({
    accept: '.draggable-stash-item',
    hoverClass: 'stash-hover',
    drop: function(e, ui) {
      var itemId = $(ui.draggable[0]).data('itemid');
      dropItem(itemId);
    }
  });

  // Adds a scroll handle to run when a new message arrives
  var self = this;
  this.autorun(function() {
    if(self.subscriptionsReady()) {
      changesHandle = Messages.find({'channel.name': Session.get('channel')}).observeChanges({
        added: scrollToBottom
      });
    }
  });
});

Template.tradingFloor.destroyed = function() {

  // Need to destroy the handle - it will run infinitely if not explicitly released
  if (changesHandle) {
    changesHandle.stop();
  }
}


Template.tradingFloor.helpers({

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
});

Template.tradingFloor.events({
  'click .channel': function(e) {
    Session.set('channel', this.name);
  },
});

// Drops an item into the chat window
// Should probably move this into its own object somewhere
function dropItem(id) {
  var item = Items.findOne(id);

  if (!item) return;

  var $outerSpan = $('<span class="img-placeholder"></span>');
  var $innerSpan = $('<span>' + Chat.imgDelimiter + id + Chat.imgDelimiter + '</span>');
  var $img = $('<img src="' + item.iconURL + '" class="responsive-img chat-item chatItem-' + item._id + '" data-itemid="' + item._id + '">');

  $outerSpan.append($innerSpan);
  $outerSpan.append($img);

  $('#chat_message').append($outerSpan);

  // Make the experience nice after dropping it
  // Find the last element of this type and put the cursor after it
  $('#chat_message').focus();
  var lastElem = $('.chatItem-' + item._id).last()[0];
  placeCaretAfterNode(lastElem);
}

// Moves the text cursor to the end
function placeCaretAfterNode(node) {
  if (typeof window.getSelection != "undefined") {
    var range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

var scrollToBottom = _.throttle(function() {
  $('.chatTextWindow').animate({
    scrollTop: $('.chatTextWindow').get(0).scrollHeight
  }, 500);
}, 500);
