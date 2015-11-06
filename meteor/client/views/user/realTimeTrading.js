function findMe(trade) {
  return trade.user1Id === Meteor.userId() ? 'user1Items' : 'user2Items';
}

function toggleItem(tradeId, item) {
  var itemId = item._id;

  // check if it is already in the trade
  var selector = {
    _id: tradeId,
    'user1Items._id': { $ne: itemId },
    'user2Items._id': { $ne: itemId }
  };

  var trade = RealTimeTrade.findOne(selector);
  var doc = {};

  // Not already in trade
  if (!trade) {

    trade = RealTimeTrade.findOne(tradeId);

    // remove the element from the array
    doc.$pull = {};
    doc.$pull[findMe(trade)] = { _id: itemId };

  // Item is in trade
  } else {

    doc.$push = {};
    doc.$push[findMe(trade)] = item;
  }

  RealTimeTrade.update(tradeId, doc);
}

Template.realTimeTrading.helpers({
  realTime: function() {
    return Session.get('realTime');
  },

  inProgress: function() {
    return false;
  },

  myItems: function() {
    var userId = Meteor.userId();

    if (userId === this.user1Id) {
      return this.user1Items;
    } else if (userId === this.user2Id) {
      return this.user2Items;
    }
  },

  theirItems: function() {
    var userId = Meteor.userId();

    if (userId === this.user1Id) {
      return this.user2Items;
    } else if (userId === this.user2Id) {
      return this.user1Items;
    }
  },

  stashOptions: function() {
    var userId = Meteor.userId();
    var trade = this;

    return {
      items: Items.find({ userId: userId, status: Enums.ItemStatus.STASH, deleteInd: false }).fetch(),
      columns: '3',
      class: '',
      selectedItems: trade[findMe(trade)],
      ready: true,
      addItemLink: true
    };
  },

  messages: function() {
    var users = [ this.user1Id, this.user2Id ];
    var channel = Channels.findOne({ publishedToUsers: { $all: users }, category: 'Private' });
    return Messages.find({'channel.name': channel.name }, { sort: { datePosted: 1 } });
  },

  textWithImages: function() {
    return Spacebars.SafeString(Chat.insertImagesForDisplay(this));
  },

  // items: function() {
  //   var fields = ['name', 'type'];
  //   var selector = {marketable: 1, deleteInd: false};
  //   var options = {limit: 5};
  //   //don't want to search until user enters something
  //   if(searchText.get()) {
  //     return Items.getItems(searchText.get(), fields, selector, options );
  //   } else {
  //     return null;
  //   }
  // },
  // getOtherPlayerName: function() {
  //   //TODO: denormalize profile name into real time trade
  //   if(Meteor.userId() === this.user1Id) {
  //     return this.user2Id;
  //   } else {
  //     return this.user1Id;
  //   }
  // },
  // getOtherUserItems: function() {
  //   if(Meteor.userId() === this.user1Id) {
  //     return this.user2Items;
  //   } else {
  //     return this.user1Items;
  //   }
  // },
  // tradeItems: function() {
  //   if(Meteor.userId() === this.user1Id) {
  //     return this.user1Items;
  //   } else {
  //     return this.user2Items;
  //   }
  // },
  // isDone: function() {
  //   if(Meteor.userId() === this.user1Id) {
  //     return this.user1Stage === 'DONE';
  //   } else {
  //     return this.user2Stage === 'DONE';
  //   }
  // },
  // isConfirmed: function() {
  //   if(Meteor.userId() === this.user1Id) {
  //     return this.user1Stage === 'CONFIRMED';
  //   } else {
  //     return this.user2Stage === 'CONFIRMED';
  //   }
  // },
  // stage: function() {
  //   var userStage = "";
  //   if(Meteor.userId() === this.user1Id) {
  //     userStage = "user1Stage";
  //   } else {
  //     userStage = "user2Stage";
  //   }
  //   if(this[userStage] === "TRADING") {
  //     return "done";
  //   } else if(this[userStage] === "DONE") {
  //     return "confirm";
  //   } else if(this[userStage] === "CONFIRMED") {
  //     return "confirmed";
  //   } else {
  //     //ERROR
  //   }
  // },
  // isTrading: function() {
  //   if(Meteor.userId() === this.user1Id) {
  //     return this.user1Stage === "TRADING";
  //   } else {
  //     return this.user2Stage === "TRADING";
  //   }
  // },
  // messages: function() {
  //   return Messages.find({'channel.name': Session.get('channel')});
  // },
});

Template.realTimeTrading.events({
  'click .my-realtime-items .item-infoed': function(e) {
    e.preventDefault();

    var trade = Session.get('realTime');

    if (trade) {
      toggleItem(trade._id, this);
    }
  },

  'click .addMyItem': function(e) {
    searchText.set('');
    $('#search').val('');
    Meteor.call('addTradeItem', this, Template.parentData()._id,function(error) {
      if(error) {
        sAlert.error("Cannot add that item");
      }
    });
  },
  'click .removeMyItem': function(e) {
    Meteor.call('removeTradeItem', this, Template.parentData()._id,function(error) {
      if(error) {
        sAlert.error("Cannot add that item");
      }
    });
  },
  'click .done': function(e) {
    Meteor.call('setStatusDone', this._id, function(error) {
      if(error) {
        console.log(error.reason);
      }
    });
  },
  'click .confirm': function(e) {
    Meteor.call('setStatusConfirm', this._id, function(error) {
      if(error) {
        console.log(error.reason);
      }
    });
  }
});
