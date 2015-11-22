Template.marketRow.helpers({
  contWidth: function() {
    if (this.showControls) {
      return 'cell45';
    } else {
      return 'cell55';
    }
  },

  icon: function(isGeneric) {
    return this.iconURL || this.image_url;
  },

  notMyListing: function() {
    var listingUserId = this.data.user._id;
    return Meteor.userId() !== listingUserId;
  }
});

Template.marketRow.events({
  'click .removeListing': function(e) {
    e.preventDefault();
    Meteor.call('removeListing', this.data._id, function(error) {
      if(error) {
        sAlert.error("Could not remove listing");
      } else {
        sAlert.success("Listing successfully removed");
      }
    });
  }
});
