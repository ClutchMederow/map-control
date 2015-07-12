var searchText = new ReactiveVar('');
Session.set('tradeItems', []);
var marketSearchText = new ReactiveVar('');
Session.set('marketItems', []);

Template.postTradeRequest.onCreated(function() {
  searchText.set('');
  Meteor.call('getPlayerInventory', Meteor.userId(), function(error) {
    if(error) {
      console.log(error.reason);
    }
  });
});

Template.postTradeRequest.onRendered(function() {
  $('ul.tabs').tabs();
});

Template.postTradeRequest.helpers({
  //Items will be stored on player's desktop
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
  availableItems: function() {
    var fields = ['name', 'type'];
    var selector = {marketable: 1, deleteInd: false};
    var options = {limit: 5};
    //don't want to search until user enters something
    if(marketSearchText.get()) {
      return InventoryItems.getItems(marketSearchText.get(), fields, selector, options );
    } else {
      return null;
    }
  },
  existsValue: function(value) {
    var newValue = value.trim();
    //is it an empty string, if not don't show it
    return _.isEmpty(value) ? false : true;
  },
  tradeItems: function() {
    return Session.get('tradeItems');
  },
  marketItems: function() {
    return Session.get('marketItems');
  }
});

Template.postTradeRequest.events({
  "keyup #search": _.throttle(function(e) {
    searchText.set($(e.target).val().trim());
  }, 200),
  "keyup #market_search": _.throttle(function(e) {
    marketSearchText.set($(e.target).val().trim());
  }, 200),
  'click .addItem': function(e) {
    var tradeItems = Session.get('tradeItems');
    tradeItems.push(this);
    Session.set('tradeItems', tradeItems);
    searchText.set('');
    $('#search').val('');
  },
  'click .addMarketItem': function(e) {
    var marketItems = Session.get('marketItems');
    marketItems.push(this);
    Session.set('marketItems', marketItems);
    marketSearchText.set('');
    $('#market_search').val('');
  }
});
