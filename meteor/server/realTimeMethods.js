Meteor.methods({
  createRealTimeTrade: function(user2Id) {
    check(user2Id, String);
    DB.insertRealTimeTrade(this.userId, user2Id);
  },
  acceptRealTimeTrade: function(tradeId) {
    check(tradeId, String);
    var trade = RealTimeTrade.findOne(tradeId);
    //security check
    if(this.userId === trade.user2Id) {
      DB.acceptRealTimeTrade(tradeId);
      return tradeId;
    } else {
      throw new Meteor.Error("SECURITY_ERROR", "You are not authorized to accept this trade");
    }
  },
  rejectRealTimeTrade: function(tradeId) {
    check(tradeId, String);
    var trade = RealTimeTrade.findOne(tradeId);
    //security check
    if(this.userId === trade.user2Id) {
      DB.rejectRealTimeTrade(tradeId);
      return tradeId;
    } else {
      throw new Meteor.Error("SECURITY_ERROR", "You are not authorized to reject this trade");
    }
  }
});
