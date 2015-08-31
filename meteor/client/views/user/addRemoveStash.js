var userInventoryItems = new Mongo.Collection(null);

Template.addRemoveStash.helpers({
  stashItems: function() {
    var userId = Meteor.userId();
    return Items.find({ userId: userId, status: Enums.ItemStatus.STASH }).fetch();
  },

  inventoryItems: function() {
    return userInventoryItems.find().fetch();
  }
});

Template.addRemoveStash.onCreated(function() {
  userInventoryItems.remove({});

  Meteor.call('getPlayerInventory', function(err, res) {
    if (err) {
      console.log(err);
    } else {
      _.each(res, function(item) {
        userInventoryItems.insert(item);
      });
    }

    console.log(userInventoryItems.find().count());
  });

});