var searchText = new ReactiveVar('');
Session.set('currentTrade', []);

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
    var options = {};
    //don't want to search until user enters something
    if(searchText.get()) {
      return Items.getItems(searchText.get(), fields,options );
    } else {
      return null;
    }
  },
  existsValue: function(value) {
    var newValue = value.trim();
    //is it an empty string, if not don't show it
    return _.isEmpty(value) ? false : true;
  },
  currentTrade: function() {
    return Session.get('currentTrade');
  }
});

Template.postTradeRequest.events({
  "keyup #search": _.throttle(function(e) {
    searchText.set($(e.target).val().trim());
  }, 200),
  'click .addItem': function(e) {
    var currentTrade = Session.get('currentTrade');
    currentTrade.push(this);
    Session.set('currentTrade', currentTrade);
    searchText.set('');
    $('#search').val('');
  }
});
