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
});

Template.market.helpers({
  listings: function() {
    if(searchText.get()) {
      var fields = ['name', 'type'];
      return Listings.searchItems(searchText.get(), fields);
    } else {
      return Listings.find();
    }
  }
});

Template.market.events({
  "keyup #search": _.throttle(function(e) {
    searchText.set($(e.target).val().trim());
  }, 200)
});
