var searchText = new ReactiveVar('');

Template.portableStash.onCreated(function() {
  searchText.set('');
});

Template.portableStash.helpers({
  items: function() {
    var fields = ['name', 'type'];
    var selector = { userId: Meteor.userId(), marketable: 1, deleteInd: false, status: Enums.ItemStatus.STASH };
    var options = {};
    //don't want to search until user enters something
    if(searchText.get()) {
      return Items.getItems(searchText.get(), fields, options);
    } else {
      return Items.find(selector);
    }
  },

  existsValue: function(value) {
    var newValue = value.trim();
    //is it an empty string, if not don't show it
    return !_.isEmpty(value);
  }
});

Template.portableStash.events({
  "keyup #search": _.throttle(function(e) {
    searchText.set($(e.target).val().trim());
  }, 200),
});
