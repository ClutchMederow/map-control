
Template.itemContainer.onCreated(function() {
  // searchText.set('');
  searchBoxId = Random.id();

  this.searchText = new ReactiveVar('');
  this.searchBoxId;
  var eventMap = {};
  var self = this;

  eventMap['keyup #' + searchBoxId] = _.throttle(function(e) {
    self.searchText.set($(e.target).val().trim());
  }, 200);

  Template.itemContainer.events(eventMap);
});

Template.itemContainer.helpers({
  colWidth: function(columns) {
    return columns ? 's' + Math.round(12/columns) : 's3';
  },

  filteredItems: function() {
    var fields = ['name', 'type'];

    //don't want to search until user enters something
    if(Template.instance().searchText.get()) {
      return SearchFunctions.searchArray(this.items, Template.instance().searchText.get(), fields);
    } else {
      return this.items;
    }
  },

  searchBoxId: function() {
    return searchBoxId;
  },

  selected: function() {
    if (Template.instance().data) {
      if (Template.instance().data.selectedItems.findOne(this._id)) {
        return 'selected';
      } else {
        return '';
      }
    }
  }
});



