var searchText = new ReactiveVar('');


Template.itemSearch.rendered = function() {
  searchText.set('');
};

Template.itemSearch.helpers({
  getItems: function() {
    var fields = ['name', 'type'];
    var selector = {deleteInd: false};
    var options = {};
    //don't want to search until user enters something
    if(searchText.get()) {
      return Items.getItems(searchText.get(), fields,options );
    }
  }
});

// TODO: This should be refactored to a single click handler on the parent element
// using data attributes as the set value
// Should also set it to allow users to click twice to reverse the ordering
Template.itemSearch.events({
  "keyup #search": _.throttle(function(e) {
    searchText.set($(e.target).val().trim());
  }, 200),
});
