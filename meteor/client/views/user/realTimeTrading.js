var searchText = new ReactiveVar('');

Template.realTimeTrading.onCreated(function() {
  searchText.set('');
});

Template.realTimeTrading.helpers({
  items: function() {
    var fields = ['name', 'type'];
    var selector = {marketable: 1, deleteInd: false};
    var options = {limit: 5};
    //don't want to search until user enters something
    if(searchText.get()) {
      return InventoryItems.getItems(searchText.get(), fields, selector, options );
    } else {
      return null;
    }
  },
  getOtherPlayerName: function() {
    //TODO: denormalize profile name into real time trade
    if(Meteor.userId() === this.user1Id) {
      return this.user2Id;
    } else {
      return this.user1Id;
    }
  },
  getOtherUserItems: function() {
    if(Meteor.userId() === this.user1Id) {
      return this.user2Items;
    } else {
      return this.user1Items;
    }
  },
  tradeItems: function() {
    if(Meteor.userId() === this.user1Id) {
      return this.user1Items;
    } else {
      return this.user2Items;
    }
  },
  isDone: function() {
    if(Meteor.userId() === this.user1Id) {
      return this.user1Stage === 'DONE';
    } else {
      return this.user2Stage === 'DONE';
    }
  },
  isConfirmed: function() {
    if(Meteor.userId() === this.user1Id) {
      return this.user1Stage === 'CONFIRMED';
    } else {
      return this.user2Stage === 'CONFIRMED';
    }
  },
  stage: function() {
    var userStage = ""; 
    if(Meteor.userId() === this.user1Id) {
      userStage = "user1Stage";
    } else {
      userStage = "user2Stage";
    }
    if(this[userStage] === "TRADING") {
      return "done";
    } else if(this[userStage] === "DONE") {
      return "confirm";
    } else if(this[userStage] === "CONFIRMED") {
      return "confirmed";
    } else {
      //ERROR
    }
  },
  isTrading: function() {
    if(Meteor.userId() === this.user1Id) {
      return this.user1Stage === "TRADING";
    } else {
      return this.user2Stage === "TRADING";
    }
  }
});

Template.realTimeTrading.events({
  "keyup #search": _.throttle(function(e) {
    searchText.set($(e.target).val().trim());
  }, 200),
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
    console.log(this);
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
