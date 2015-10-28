Meteor.methods({
  addTradeURL: function(tradeURL, email) {
    check(tradeURL, String);
    check(email, String);
    return DB.users.updateTradeURL(this.userId, tradeURL, email);
  }
});
