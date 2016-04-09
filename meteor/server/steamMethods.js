Meteor.methods({
  getPlayerInventory: function() {
    if (this.userId) {
      return SteamAPI.getAllItemsForPlayer(this.userId);
    } else {
      throw new Meteor.Error('NO_USER', 'User not found');
    }
  },

  depositItems: function(items) {
    check(items, [String]);
    this.unblock();
    return DispatcherAPI.depositItems(this.userId, items);
  },

  withdrawItems: function(items) {
    check(items, [String]);
    this.unblock();
    return DispatcherAPI.withdrawItems(this.userId, items);
  },
});
