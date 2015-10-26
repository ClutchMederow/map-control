var offerManager = new OfferManager();

Template.offerModal.helpers({
  listing: function() {
    return Session.get('offer');
  },

  listingItems: function() {
    return this.items;
  },

  requestedItems: function() {
    return this.request;
  },

  stashOptions: function() {
    var userId = Meteor.userId();

    return {
      items: Items.find({ userId: userId, status: Enums.ItemStatus.STASH, deleteInd: false }).fetch(),
      columns: '6',
      class: '',
      selectedItems: offerManager.selectedItems,
      ready: true
    };
  },

  selectedItems: function() {
    return offerManager.selectedItems.find().fetch();
  }
});

Template.offerModal.events({
  'click #makeOffer': function(e) {
    Meteor.call('createOffer', this._id, function(error){
      if(error) {
        console.log(error.reason);
      } else {
        console.log('Listing successful!');
      }
    });
  },

  'click #offer-stash-items .contained-item': function(e) {
    e.preventDefault();
    offerManager.toggleItem(this);
    console.log(this);
  }
});



