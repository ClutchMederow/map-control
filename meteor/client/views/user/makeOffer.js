var searchText = new ReactiveVar('');
Session.set('mySelectedItems', []);

Template.postTradeRequest.onCreated(function() {
  searchText.set('');
  Meteor.call('getPlayerInventory', Meteor.userId(), function(error) {
    if(error) {
      console.log(error.reason);
    }
  });
});

Template.makeOffer.helpers({
  listingItems: function() {
    return this.items;
  },
  myItems: function() {
    var fields = ['name', 'type'];
    var selector = {marketable: 1, deleteInd: false};
    var options = {limit: 5};
    //don't want to search until user enters something
    if(searchText.get()) {
      return InventoryItems.getItems(searchText.get(), fields, selector, options );
    } else {
      return null;
    }
  },
  mySelectedItems: function() {
    return Session.get('mySelectedItems');
  }
});

Template.makeOffer.events({
  "keyup #search": _.throttle(function(e) {
    searchText.set($(e.target).val().trim());
  }, 200),
  'click .addMyItem': function(e) {
    var mySelectedItems = Session.get('mySelectedItems');
    mySelectedItems.push(this);
    Session.set('mySelectedItems', mySelectedItems);
    searchText.set('');
    $('#search').val('');
  },
  'click .removeMyItem': function(e) {
    var mySelectedItems = Session.get("mySelectedItems");
    var item = this;
    Session.set("mySelectedItems", _.filter(mySelectedItems, function(tradeItem) {
      return tradeItem._id !== item._id; 
    }));
  },
  'click #makeOffer': function(e) {
    Meteor.call('createOffer', listingId, Session.get('mySelectedItems'), 
      function(error){
        if(error) {
          console.log(error.reason);
        } else {
          console.log('Listing successful!');
        }
    });
  }
});
