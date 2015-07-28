/*
quality, type, name, 
what they're asking for
market value of item
how many people have looked at this
picture of gun
*/
Template.market.onRendered(function() {
  $('.tooltipped').tooltip({delay: 50}); 
});

Template.market.helpers({
  listings: function() {
    return Listings.find();
  }
});

Template.market.events({

});
