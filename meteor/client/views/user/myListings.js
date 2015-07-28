Template.myListings.helpers({
  listings: function() {
    var userId = Meteor.userId();
    return Listings.find({"user._id": userId});
  }
});
