
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
      var selected = Template.instance().data.selectedItems;
      var isSelected = false;

      // Need to support both cursors and arrays
      if (selected instanceof Mongo.Collection) {
        isSelected = !!selected.findOne(this._id);
      } else if (selected instanceof Array) {
        isSelected = !!_.findWhere(selected, { _id: this._id });
      }

      if (isSelected) {
        return 'selected';
      } else {
        return '';
      }
    }

    return '';
  },

  icon: function(isGeneric) {
    if (isGeneric) {
      return this.image_url;
    } else {
      return this.iconURL;
    }
  },

  privateInv: function() {
    return this.invError && (this.invError.error === Enums.MeteorError.PRIVATE_INVENTORY);
  },

  editProfileLink: function() {
    var user = Meteor.user();
    if (user && user.services && user.services.steam) {
      return Constants.editProfile.replace('CONST_STEAM_ID', user.services.steam.id);
    }

    return '';
  }
});

Template.itemContainer.events({
  'mouseenter.item-info-tooltip .portable-stash .item-infoed': function(e) {
    DraggableItems.itemInfo.mousein(e, this);
  },

  'mouseleave.item-info-tooltip .portable-stash .item-infoed': function(e) {
    DraggableItems.itemInfo.mouseout(e);
  },

  'click .add-item-link a': function() {
    Session.set('listing', false);
    if (!Session.equals('offer', null)) {
      Session.set('offer', null);
    }
    return true;
  }
});


