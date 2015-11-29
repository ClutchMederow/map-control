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

  "click #submitSearch": function(e) {
    e.preventDefault();
    Router.go('market', {userId: this.userId, limit: this.limit}, 
              {query: "search=" + searchText.get() + "&filter=" + genericFilter.getName()});
  },
  "click #clear": function(e) {
    e.preventDefault();
    searchText.set(''); 
    $("#search").val("");
    Router.go('market', {userId: this.userId, limit: this.limit}, 
              {query: "search=" + searchText.get() + "&filter=" + genericFilter.getName()});
  },

  "click .singleItem": function(e) {
    e.preventDefault();
    genericFilter.add(this);
    var dataContext = Template.parentData(0);
    Router.go('market', {userId: dataContext.userId, limit: dataContext.limit}, 
              {query: "search=" + 
                searchText.get() + "&filter=" + genericFilter.getName()});
  },

  'click .filter-term': function() {
    genericFilter.remove(this);
    var dataContext = Template.parentData(0);
    Router.go('market', {userId: dataContext.userId, limit: dataContext.limit}, 
              {query: "search=" + 
                searchText.get() + "&filter=" + genericFilter.getName()});
  },

  'mouseenter.item-info-tooltip .market .item-infoed': function(e) {
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
  },
  'click #addListing': function(e) {
    e.preventDefault();
    Session.set('listing', true);
  },
});
