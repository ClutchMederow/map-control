Meteor.methods({
  getPlayerInventory: function() {
    if (this.userId) {
      return SteamAPI.getAllItemsForPlayer(this.userId);
    } else {
      throw new Meteor.Error('NO_USER', 'User not found');
    }
  }
});
