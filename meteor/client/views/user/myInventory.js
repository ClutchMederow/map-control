var searchText = new ReactiveVar('');

Template.myInventory.onCreated(function() {
  searchText.set('');
  Meteor.call('getPlayerInventory', Meteor.userId(), function(error) {
    if(error) {
      console.log(error.reason);
    }
  });
});

Template.myInventory.helpers({
  //Items will be stored on player's desktop
  items: function() {
    var fields = ['name', 'type'];
    var selector = {userId: Meteor.userId(), marketable: 1, deleteInd: false};
    var options = {};
    //don't want to search until user enters something
    if(searchText.get()) {
      return InventoryItems.getItems(searchText.get(), fields,options );
    } else {
      return InventoryItems.find(selector);
    }
  },
  existsValue: function(value) {
    var newValue = value.trim();
    //is it an empty string, if not don't show it
    return _.isEmpty(value) ? false : true;
  }
});

Template.myInventory.events({
  "keyup #search": _.throttle(function(e) {
    searchText.set($(e.target).val().trim());
  }, 200),
});
