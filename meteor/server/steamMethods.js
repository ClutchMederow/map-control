Meteor.methods({
  getPlayerInventory: function() {
    if (this.userId) {
      return SteamAPI.getAllItemsForPlayer(this.userId);
    } else {
      throw new Meteor.Error('NO_USER', 'User not found');
    }
  },

  depositItems: function(items) {
    return Dispatcher.depositItems(this.userId, items);
  },

  withdrawItems: function(items) {
    return Dispatcher.withdrawItems(this.userId, items);
  }
});
