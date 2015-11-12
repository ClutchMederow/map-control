var loading = new ReactiveVar(false);

CashItem = function() {
  this.open = false;
  this.template = null;
};

CashItem.prototype.init = function(cb) {
  this.completedCallback = cb;
  this.open = true;
};

CashItem.prototype.markAsDone = function(amount) {
  this.completedCallback(amount);
  this.open = false;
};

CashItem.prototype.markAsCancelled = function() {
  Blaze.remove(this.template);
  this.open = false;
};

var currentCash = new CashItem();

function findMe(trade) {
  return trade.user1Id === Meteor.userId() ? 'user1Items' : 'user2Items';
}

function getMe(trade) {
  return trade.user1Id === Meteor.userId() ? 'user1' : 'user2';
}

function getThem(trade) {
  return trade.user1Id === Meteor.userId() ? 'user2' : 'user1';
}

function getStageField(trade) {
  return trade.user1Id === Meteor.userId() ? 'user1Stage' : 'user2Stage';
}

function getTheirStageField(trade) {
  return trade.user1Id === Meteor.userId() ? 'user2Stage' : 'user1Stage';
}

function clickBucks(item, trade, target) {
  if (currentCash.open) return;

  currentCash.init(function(amount) {
    var cashItem = _.extend({}, item);
    cashItem.amount = amount;

    var doc = { $push: {} };
    doc.$push[findMe(trade)] = cashItem;

    RealTimeTrade.update(trade._id, doc);
    Blaze.remove(this.template);
  });

  currentCash.template = Blaze.renderWithData(Template.ironbucksPicker, { currentCash: currentCash }, target.parentNode);
}

function toggleItem(tradeId, item, target) {
  var itemId = item._id;

  // check if it is already in the trade
  var selector = {
    _id: tradeId,
    'user1Items._id': { $ne: itemId },
    'user2Items._id': { $ne: itemId }
  };

  var trade = RealTimeTrade.findOne(selector);
  var doc = {};

  // Item is already selected
  if (!trade) {

    trade = RealTimeTrade.findOne(tradeId);

    // remove the element from the array
    doc.$pull = {};
    doc.$pull[findMe(trade)] = { _id: itemId };

    RealTimeTrade.update(tradeId, doc);

  // Not already in trade
  } else {

    if (item.name === 'IronBucks') {
      clickBucks(item, trade, target);
    } else {
      doc.$push = {};
      doc.$push[findMe(trade)] = item;
      RealTimeTrade.update(tradeId, doc);
    }
  }
}

Template.realTimeTrading.onCreated(function() {
  loading.set(false);
  var templateInstance = this;

  templateInstance.autorun(function() {
    var trade = Session.get('realTime');

    if (trade) {
      var users = [ trade.user1Id, trade.user2Id ];
      templateInstance.channel = Channels.findOne({ publishedToUsers: { $all: users }, category: 'Private' });

      // Adds a scroll handle to run when a new message arrives
      if (templateInstance.changesHandle) {
        templateInstance.changesHandle.stop();
      }

      if (templateInstance.channel) {
        templateInstance.subscribe('messages', templateInstance.channel.name);

        templateInstance.changesHandle = Messages.find({'channel.name': templateInstance.channel.name }).observeChanges({
          added: _.throttle(function() {
            ChatFunctions.updateUnseen('realtime-modal');
            ChatFunctions.scrollToBottom('realtime-modal');
          }, 500)
        });
      }
    }
  });
});

Template.realTimeTrading.onRendered(function() {
  // Initially scroll all windows to bottom
  ChatFunctions.scrollToBottom('realtime-modal');
});

Template.realTimeTrading.helpers({
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
      class: 'make-offer-items',
      selectedItems: trade[findMe(trade)],
      ready: true,
      addItemLink: true
    };
  },

  messages: function() {
    var channel = Template.instance().channel;
    if (channel) {
      return Messages.find({'channel.name': channel.name }, { sort: { datePosted: 1 } });
    }
  },

  textWithImages: function() {
    return Spacebars.SafeString(Chat.insertImagesForDisplay(this));
  },

  leftButtonText: function() {
    var stageField = getStageField(this);
    var theirStageField = getTheirStageField(this);
    var stage = this[stageField];
    var theirStage = this[theirStageField];

    if (stage === 'TRADING') {
      return 'Cancel';
    } else if (stage === 'DONE') {
      return 'Undone';
    } else if (stage === 'CONFIRMED') {
      return '...';
    }
  },

  rightButtonText: function() {
    var stageField = getStageField(this);
    var theirStageField = getTheirStageField(this);
    var stage = this[stageField];
    var theirStage = this[theirStageField];

    if (stage === 'TRADING') {
      if (loading.get()) {
        return 'Offering...';
      } else {
        return 'Done';
      }
    } else if (stage === 'DONE') {
        if (theirStage === 'DONE' || theirStage === 'CONFIRMED') {
          return 'Confirm';
        } else {
          return 'Waiting...';
        }
    } else if (stage === 'CONFIRMED') {
      if (theirStage === 'CONFIRMED') {
        return 'Working...';
      }
      return 'Waiting...';
    }
  },

  leftButtonClass: function() {
    var stageField = getStageField(this);
    var stage = this[stageField]

    if (stage === 'TRADING') {
      return 'cancel';
    } else if (stage === 'DONE') {
      return 'undone';
    } else if (stage === 'CONFIRMED') {
      return 'disabled';
    }
  },

  rightButtonClass: function() {
    var stageField = getStageField(this);
    var stage = this[stageField]

    var theirStageField = getTheirStageField(this);
    var theirStage = this[theirStageField];

    if (stage === 'TRADING') {
      if (loading.get()) {
        return 'disabled';
      } else {
        return 'done';
      }
    } else if (stage === 'DONE') {
      if (loading.get()) {
        return 'disabled';
      } else {
        if (theirStage === 'DONE' || theirStage === 'CONFIRMED') {
          return 'confirm';
        } else {
          return 'disabled';
        }
      }
    } else if (stage === 'CONFIRMED') {
      return 'disabled';
    }
  },

  stageClass: function() {
    var me = getMe(this);
    var them = getThem(this);
    var myStage = ('me-' + this[me + 'Stage']).toLowerCase();
    var theirStage = ('them-' + this[them + 'Stage']).toLowerCase();

    return [ myStage, theirStage ].join(' ');
  },

  isDisabled: function() {
    return loading.get() ? '' : 'disabled';
  },

  otherUserName: function() {
    if(Meteor.userId() === this.user1Id) {
      return this.user2Name;
    } else {
      return this.user1Name;
    }
  },
});

Template.realTimeTrading.events({
  'click .my-realtime-items .item-infoed': function(e) {
    e.preventDefault();
    var trade = Session.get('realTime');

    if (trade) {
      toggleItem(trade._id, this, e.target);
    }
  },

  'submit .chat-inp-form': function(e, template) {
    e.preventDefault();

    if (template.channel) {
      ChatFunctions.inputMessage(e.target, template.channel.name);
    } else {
      sAlert.error('No channel');
    }
  },

  'click .done': function(e) {
    if (!loading.get()) {
      loading.set(true);

      Meteor.call('setStatusDone', this._id, function(error) {
        loading.set(false);

        if(error) {
          sAlert.error(error.reason);
        }
      });
    }
  },

  'click .confirm': function(e) {
    if (!loading.get()) {
      loading.set(true);
      Meteor.call('setStatusConfirm', this._id, function(error) {
        loading.set(false);

        if(error) {
          sAlert.error(error.reason);
        }
      });
    }
  },

  'click .undone': function(e) {
    e.preventDefault();
    Meteor.call('setStatusTrading', this._id);
  },

  'click .cancel': function(e) {
    e.preventDefault();
    Meteor.call('rejectRealTimeTrade', this._id);
  },

  'click .hide-trade': function(e) {
    e.preventDefault();
    Session.set('realTime', null);
  },
});

Template.realTimeTrading.destroyed = function() {

  // Need to destroy the handle - it will run infinitely if not explicitly released
  if (this.changesHandle) {
    this.changesHandle.stop();
  }
};
