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

  // var user  = Meteor.user();
  // if (user && user.services && user.services.steam && user.services.steam.id) {
  //   var steamId = user.services.steam.id;

  //   ClientSteamAPI.getPlayerInventory(steamId, function(data) {
  //     // console.log(data);
  //     console.log('yup');
  //   });
  // } else {
  //   console.log('no steam ID');
  // }
});