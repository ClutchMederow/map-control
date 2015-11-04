Meteor.methods({
  addTradeURL: function(tradeURL, email) {
    check(tradeURL, String);
    check(email, String);
    return DB.users.updateTradeURL(this.userId, tradeURL, email);
  },
  setTourComplete: function() {
    Meteor.users.update(this.userId, {$set: {"profile.firstTimeUser": false}});
  }
});
