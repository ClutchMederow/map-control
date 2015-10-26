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
    offerManager.execute(this.data._id, function(error) {
      if(error) {
        sAlert.error(error.reason);
      } else {
        offerManager.clearSelected();
        Session.set('offer', null);
        sAlert.success('Offer sent!');
      }
    });
  },

  'click #cancelModal': function(e) {
    e.preventDefault();
    Session.set('offer', null);
    offerManager.clearSelected();
  },

  'click #offer-stash-items .contained-item': function(e) {
    e.preventDefault();
    offerManager.toggleItem(this);
  },

  'mouseenter.item-info-tooltip #current-offer-row .item-infoed': function(e) {
    DraggableItems.itemInfo.mousein(e, this);
  },

  'mouseleave.item-info-tooltip #current-offer-row .item-infoed': function(e) {
    DraggableItems.itemInfo.mouseout(e);
  },
});



