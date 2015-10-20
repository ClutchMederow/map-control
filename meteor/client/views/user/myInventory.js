var searchText = new ReactiveVar('');
var selectedItem = new ReactiveVar(null);

Template.myInventory.onCreated(function() {
  searchText.set('');
});

Template.myInventory.helpers({
  //Items will be stored on player's desktop
  items: function() {
    var fields = ['name', 'type'];
    var selector = { userId: Meteor.userId(), marketable: 1, deleteInd: false, status: Enums.ItemStatus.STASH };
    var options = {};
    //don't want to search until user enters something
    if(searchText.get()) {
      return Items.getItems(searchText.get(), fields, selector, options);
    } else {
      return Items.find(selector);
    }
  },

  selectedItem: function() {
    return selectedItem.get();
  }
});

Template.myInventory.events({
  "keyup #search": _.throttle(function(e) {
    searchText.set($(e.target).val().trim());
  }, 200),

  'click .item-modal-trigger': function() {
    selectedItem.set(this);
    $('#itemModal').openModal();
  }
});
