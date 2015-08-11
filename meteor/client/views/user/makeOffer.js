var searchText = new ReactiveVar('');
Session.set('mySelectedItems', []);

Template.postTradeRequest.onCreated(function() {
  searchText.set('');
});

Template.makeOffer.helpers({
  listingItems: function() {
    return this.items;
  },
  requestedItems: function() {
    return this.request;
  }
});

Template.makeOffer.events({
  'click #makeOffer': function(e) {
    Meteor.call('createOffer', this._id, function(error){
        if(error) {
          console.log(error.reason);
        } else {
          console.log('Listing successful!');
        }
    });
  }
});
