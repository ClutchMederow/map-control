function channelsCursor() {
    return Channels.find();
}

var changesHandle;

Template.tradingFloor.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe('messages', Iron.controller().getParams().channel);
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

      // gives an initial state to the accordion
      if ($('.active .active-channel').length === 0) {
        this.$('.active-channel').parent().parent().find('.collapsible-header').click()
      }

    }.bind(this));
  }.bind(this));

  // Define the area where we can drop stash items to be inserted into the chat
  DraggableItems.droppable('.tradingFloor', '.draggable-stash-item', dropItem);

  // Adds a scroll handle to run when a new message arrives
  changesHandle = Messages.find({'channel.name': Iron.controller().getParams().channel }).observeChanges({
    added: scrollToBottom
  });
});

Template.tradingFloor.destroyed = function() {

  // Need to destroy the handle - it will run infinitely if not explicitly released
  if (changesHandle) {
    changesHandle.stop();
  }
};

Template.tradingFloor.helpers({

  messages: function() {
    return Messages.find({'channel.name': Iron.controller().getParams().channel }, { sort: { datePosted: 1 } });
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
    return Iron.controller().getParams().channel;
  },
});

Template.tradingFloor.events({
  'mouseenter.item-info-tooltip .chatTextWindow .item-infoed': function(e) {
    var itemIndex = $(e.target).data('ind');
    var thisItem = this.items[itemIndex];

    if (thisItem) {
      DraggableItems.itemInfo.mousein(e, thisItem);
    }
  },

  'mouseleave.item-info-tooltip .chatTextWindow .item-infoed': function(e) {
    DraggableItems.itemInfo.mouseout(e);
  }
});

// Drops an item into the chat window
// Should probably move this into its own object somewhere
function dropItem(id) {
  var item = Items.findOne(id);
  if (!item) return;

  // Creates a span with two children - one for the image and one for some hidden text
  // We do this so the image can be represented in the DB when this comment is posted
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
