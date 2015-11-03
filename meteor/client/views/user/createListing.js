var listingManager = new ListingManager();

Template.createListing.onCreated(function() {
  Session.set('listing', false);
});

Template.createListing.helpers({
  listing: function() {
    return Session.get('listing');
  },

  stashOptions: function() {
    var userId = Meteor.userId();

    return {
      items: Items.find({ userId: userId, status: Enums.ItemStatus.STASH, deleteInd: false }).fetch(),
      columns: '3',
      class: 'make-offer-items',
      selectedItems: listingManager.myItems,
      ready: true,
      addItemLink: true
    };
  },

  lookingForStashOptions: function() {
    var userId = Meteor.userId();

    return {
      items: GenericItems.find().fetch(),
      columns: '3',
      class: 'make-offer-items',
      selectedItems: listingManager.theirItems,
      ready: true,
      addItemLink: false,
      generic: true
    };
  },

  myItems: function() {
    return listingManager.myItems.find().fetch();
  },

  theirItems: function() {
    return listingManager.theirItems.find().fetch();
  },

  inProgress: function() {
    return listingManager.inProgress.get();
  }
});

Template.createListing.events({
  // 'click #makeOffer': function(e) {
  //   offerManager.execute(this.data._id, function(error) {
  //     if(error) {
  //       sAlert.error(error.reason);
  //     } else {
  //       offerManager.clearSelected();
  //       Session.set('offer', null);
  //       sAlert.success('Offer sent!');
  //     }
  //   });
  // },

  'click #cancelModal': function(e) {
    e.preventDefault();
    Session.set('listing', false);
    listingManager.clearSelected();
  },

  'click #postTrade': function(e) {
    listingManager.execute(function(error){
      if(error) {
        sAlert.error(error.reason);
      } else {
        Session.set('listing', false);
        sAlert.success('Listing successful!');
      }
    });
  },

  'click #my-listing-items .contained-item': function(e) {
    e.preventDefault();
    listingManager.toggleMyItem(this);
  },

  'click #their-listing-items .contained-item': function(e) {
    e.preventDefault();
    listingManager.toggleTheirItem(this);
  },

  'mouseenter.item-info-tooltip #current-listing-row .item-infoed': function(e) {
    DraggableItems.itemInfo.mousein(e, this);
  },

  'mouseleave.item-info-tooltip #current-listing-row .item-infoed': function(e) {
    DraggableItems.itemInfo.mouseout(e);
  },
});



