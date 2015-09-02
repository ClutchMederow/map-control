Meteor.methods({
  getPlayerInventory: function() {
    if (this.userId) {
      return SteamAPI.getAllItemsForPlayer(this.userId);
    } else {
      throw new Meteor.Error('NO_USER', 'User not found');
    }
  },

  depositItems: function(items) {
    var transId = Dispatcher.depositItems(this.userId, items);
    console.log(transId);

    return transId;
  }
});
