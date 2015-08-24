var searchText = new ReactiveVar('');

Template.portableStash.onCreated(function() {
  searchText.set('');
});

Template.portableStash.rendered = function() {

  // All stash items should be draggable
  // http://stackoverflow.com/questions/1805210/jquery-drag-and-drop-using-live-events

  // We need to have the mouseover event bound to accound for items being destroyed and recreated in the
  // DOM when people use the search function. This ensures that each item is always draggable
  $('.portable-stash').on('mouseover', '.draggable-stash-item', function() {
    $(this).draggable({
      revert: true,
      revertDuration: 0
    });
  });
};

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
