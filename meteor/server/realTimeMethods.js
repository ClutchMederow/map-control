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
  },
  addTradeItem: function(item, tradeId) {
    check(item, Object);
    check(tradeId, String);

    var trade = RealTimeTrade.findOne(tradeId);
    if(this.userId === trade.user1Id) {
      DB.addItemToTrade(item, tradeId, "user1Items");
    } else if (this.userId === trade.user2Id)  {
      DB.addItemToTrade(item, tradeId, "user2Items");
    } else {
      throw new Meteor.Error("SECURITY_ERROR", "not authorized");
    }
  },
  removeTradeItem: function(item, tradeId) {
    check(item, Object);
    check(tradeId, String);

    var trade = RealTimeTrade.findOne(tradeId);
    if(this.userId === trade.user1Id) {
      DB.removeItemFromTrade(item, tradeId, "user1Items");
    } else if (this.userId === trade.user2Id)  {
      DB.removeItemFromTrade(item, tradeId, "user2Items");
    } else {
      throw new Meteor.Error("SECURITY_ERROR", "not authorized");
    }
  }
});
