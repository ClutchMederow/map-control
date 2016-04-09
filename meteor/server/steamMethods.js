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
    var result = DispatcherAPI.depositItems(this.userId, items);
    var link = '<a href="' + Constants.tradeOfferURL + result + '/" target="_blank" class="trade-alert">Click here to accept your trade request</a>'
    DB.addNotification(this.userId, message, 
                       {alertType: Constants.inventoryManagementTemplate, 
                       link: link});
    return result;
  },

  withdrawItems: function(items) {
    check(items, [String]);
    this.unblock();
    var result = DispatcherAPI.withdrawItems(this.userId, items);
    var message = "Please click accept to withdraw items";
    var link = '<a href="' + Constants.tradeOfferURL + result + '/" target="_blank" class="trade-alert">Click here to accept your trade request</a>'
    DB.addNotification(this.userId, message, 
                       {alertType: Constants.inventoryManagementTemplate, 
                         link: link});
    return result;
  }
});
