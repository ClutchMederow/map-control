Meteor.methods({
  addTradeURL: function(tradeURL) {
    check(tradeURL, String);
    return DB.users.updateTradeURL(this.userId, tradeURL);
  }
});