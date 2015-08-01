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
      if(trade.user1Stage !== "TRADING") {
        throw new Meteor.Error("SECURITY_ERROR", "Cannot trade item when not in trading");
      }
      DB.addItemToTrade(item, tradeId, "user1Items");
    } else if (this.userId === trade.user2Id)  {
      if(trade.user2Stage !== "TRADING") {
        throw new Meteor.Error("SECURITY_ERROR", "Cannot trade item when not in trading");
      }
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
      if(trade.user1Stage !== "TRADING") {
        throw new Meteor.Error("SECURITY_ERROR", "Cannot trade item when not in trading");
      }
      DB.removeItemFromTrade(item, tradeId, "user1Items");
    } else if (this.userId === trade.user2Id)  {
      if(trade.user2Stage !== "TRADING") {
        throw new Meteor.Error("SECURITY_ERROR", "Cannot trade item when not in trading");
      }
      DB.removeItemFromTrade(item, tradeId, "user2Items");
    } else {
      throw new Meteor.Error("SECURITY_ERROR", "not authorized");
    }
  },
  setStatusDone: function(tradeId) {
    check(tradeId, String);
    var trade = RealTimeTrade.findOne(tradeId);
    if(this.userId === trade.user1Id) {
      DB.setTradeStage(tradeId, "user1Stage", "DONE");
    } else if (this.userId === trade.user2Id)  {
      DB.setTradeStage(tradeId, "user2Stage", "DONE");
    } else {
      throw new Meteor.Error("SECURITY_ERROR", "not authorized");
    }
  },
  setStatusConfirm: function(tradeId) {
    check(tradeId, String);
    var trade = RealTimeTrade.findOne(tradeId);
    if(this.userId === trade.user1Id) {
      DB.setTradeStage(tradeId, "user1Stage", "CONFIRMED");
    } else if (this.userId === trade.user2Id)  {
      DB.setTradeStage(tradeId, "user2Stage", "CONFIRMED");
    } else {
      throw new Meteor.Error("SECURITY_ERROR", "not authorized");
    }

    //check to see if both users have confirmed trade
    DB.checkForTradeCompletion(tradeId);
  }
});
