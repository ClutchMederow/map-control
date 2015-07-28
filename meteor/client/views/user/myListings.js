Template.myListings.onRendered(function() {
  $('.tooltipped').tooltip({delay: 25});
});

Template.myListings.helpers({
  listings: function() {
    var userId = Meteor.userId();
    return Listings.find({"user._id": userId});
  }
});

Template.myListings.events({
  'click .removeListing': function(e) {
    Meteor.call('removeListing', this._id, function(error) {
      if(error) {
        console.log(error.reason);
      } else {
        console.log("Successfully removed item");
      }
    });
  }
});
