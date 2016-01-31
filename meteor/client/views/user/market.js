var searchText = new ReactiveVar('');
Session.set('searchItems', []);
var genericFilter = new GenericFilter();

Template.market.onRendered(function() {
  searchText.set('');
  $('.tooltipped').tooltip({delay: 50});
});

Template.market.onCreated(function() {
  var instance = this;

  //initialize reactive variables
  instance.loaded = new ReactiveVar(0);
  instance.limit = new ReactiveVar(5);

  instance.autorun(function() {
    var limit = instance.limit.get();
    console.log("Asking for " + limit + " listings...");

    var filterSelector = {closeDate: null};

    if(genericFilter.getName().length) {
      filterSelector = _.extend(filterSelector, 
        {'items.tags.internal_name': { $in: genericFilter.getName() }});
    }

    if(this.userId) {
      filterSelector = _.extend(filterSelector, {"user._id": this.userId});
    }

    var subscription = instance.subscribe('listings', filterSelector, searchText.get(),
                                          {sort: {datePosted: -1 }, limit: limit});
    if(subscription.ready()) {
      console.log("> Received " + limit + " listings. \n\n");
      instance.loaded.set(limit);
    } else {
      console.log("> Subscription not ready yet. \n\n");
    }
  });

  instance.listings = function() {
    return Listings.find();
  };
});

Template.market.helpers({
  getListing: function() {
    return {listingId: this._id};
  },

  filterTerms: function() {
    return genericFilter.get();
  },

  listings: function() {
    return Template.instance().listings();
  },

  hasMoreListings: function() {
    return Template.instance().listings().count() >= Template.instance().limit.get();
  },

});

Template.market.events({

  "keyup #search": _.throttle(function(e) {
    searchText.set($(e.target).val().trim());
  }, 200),

  //preventing input from enter key,
  //which causes redirect to home page
  "keydown #search": function(e) {
    if(e.which === 13) {
      e.preventDefault();
    }
  },

  "click .singleItem": function(e) {
    e.preventDefault();
    genericFilter.add(this);
  },

  'click .filter-term': function() {
    genericFilter.remove(this);
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

  'click .post-item': function(e) {
    e.preventDefault();
    Session.set('listing', true);
  },

  'click #loadMore': function(e, instance) {
    e.preventDefault();
    //note: could also use Template.instance()
    var limit = instance.limit.get();

    limit += 5;
    instance.limit.set(limit);
  },

  'click .sign-up-trigger': function(e) {
    e.preventDefault();
    $('#signup-modal').openModal();
  },
});
