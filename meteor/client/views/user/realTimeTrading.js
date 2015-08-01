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
        //TODO: remove that item
      }
    });
  },
  'click .removeMyItem': function(e) {
    Meteor.call('removeTradeItem', this, Template.parentData()._id,function(error) {
      if(error) {
        sAlert.error("Cannot add that item");
        //TODO: remove that item
      }
    });
  }
});
