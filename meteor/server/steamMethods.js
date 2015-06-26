Meteor.methods({
  getPlayerInventory: function(userId) {
    check(userId, String);
    var user = Users.findOne(userId);
    //TODO: remove Drew's user id before committing
    //user.services.steam.id
    SteamAPI.getAllItemsForPlayer("76561197965124635",userId);
  }
});
