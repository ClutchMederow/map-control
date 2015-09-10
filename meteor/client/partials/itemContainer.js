
Template.itemContainer.onCreated(function() {
  this.searchBoxId = Random.id();

  // We have to append searchText to the template instance in order to avoid closure conflicts
  // when there are multiple instances of the template
  // To do this, we create a unique id for the search box and bind the event to this id
  this.searchText = new ReactiveVar('');
  var eventMap = {};
  var self = this;

  // We bind the event here to let the random id be generated first
  eventMap['keyup #' + self.searchBoxId] = _.throttle(function(e) {
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
    return Template.instance().searchBoxId;
  },

  selected: function() {
    if (Template.instance().data && Template.instance().data.selectedItems) {
      if (Template.instance().data.selectedItems.findOne(this._id)) {
        return 'selected';
      } else {
        return '';
      }
    }
  }
});

Template.itemContainer.events({
  'mouseenter.item-info-tooltip .portable-stash .item-infoed': function(e) {
    DraggableItems.itemInfo.mousein(e, this);
  },

  'mouseleave.item-info-tooltip .portable-stash .item-infoed': function(e) {
    DraggableItems.itemInfo.mouseout(e);
  }
});


