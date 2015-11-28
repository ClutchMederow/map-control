/*
quality, type, name,
what they're asking for
market value of item
how many people have looked at this
picture of gun
*/
var searchText = new ReactiveVar('');
Session.set('searchItems', []);
var genericFilter = new GenericFilter();

Template.market.onRendered(function() {
  searchText.set('');
  $('.tooltipped').tooltip({delay: 50});
});

Template.market.helpers({
  listings: function() {
    var filterSelector = genericFilter.getName().length ? { 'items.tags.internal_name': { $in: genericFilter.getName() }} : {};
    //either 'All' or a userId from router
    var selector = filterSelector;
    if(this.userId) {
      selector = _.extend(filterSelector, {"user._id": this.userId});
    }

    var options = { sort: { datePosted: -1 } };

    if(searchText.get()) {
      var fields = ['name', 'internal_name'];
      return Listings.searchItems(selector, searchText.get(), fields, options);
    } else {
      return Listings.find(selector, options);
    }
  },

  getListing: function() {
    return {listingId: this._id};
  },

  filterTerms: function() {
    return genericFilter.get();
  }
});

Template.market.events({

  "keyup #search": _.throttle(function(e) {
    searchText.set($(e.target).val().trim());
  }, 200),

  "click .singleItem": function(e) {
    e.preventDefault();
    genericFilter.add(this);
  },

  'click .filter-term': function() {
    genericFilter.remove(this);
  },

  'mouseenter.item-info-tooltip .market .item-infoed': function(e) {
    console.log(this);
    DraggableItems.itemInfo.mousein(e, this);
  },

  'mouseleave.item-info-tooltip .market .item-infoed': function(e) {
    DraggableItems.itemInfo.mouseout(e);
  },

  'click .market .acceptTrade': function(e) {
    e.preventDefault();
    Session.set('offer', this);
  },

  'click .sendMessage': function() {
    if (this.data && this.data.user) {
      Meteor.call('startPrivateChat', this.data.user._id);
    }
  }
});
