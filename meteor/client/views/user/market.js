/*
quality, type, name, 
what they're asking for
market value of item
how many people have looked at this
picture of gun
*/
var searchText = new ReactiveVar('');
Session.set('searchItems', []);

Template.market.onRendered(function() {
  searchText.set('');
  $('.tooltipped').tooltip({delay: 50}); 
  $('.button-collapse').sideNav();
});

Template.market.helpers({
  listings: function() {
    var selector = this; //either 'All' or a userId from router
    if(searchText.get()) {
      var fields = ['name', 'type'];
      return Listings.searchItems(selector, searchText.get(), fields);
    } else {
      return Listings.find();
    }
  },
  getListing: function() {
    return {listingId: this._id};
  }
});

Template.market.events({
  "keyup #search": _.throttle(function(e) {
    searchText.set($(e.target).val().trim());
  }, 200)
});
