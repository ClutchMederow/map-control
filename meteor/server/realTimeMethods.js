/* global DB */
/* global RealTimeTrade */

Meteor.methods({
  createRealTimeTrade: function(user2Id) {
    check(user2Id, String);
    RealTimeTrade.find({ $or: [ { user1Id: this.userId }, { user2Id: this.userId } ], completed: false, deleteInd: false}).forEach(function(rtTrade) {
        if(rtTrade.user2Id === user2Id) {
          return rtTrade._id;
          // throw new Meteor.Error("EXISTING_RTT", "You have already have an active real time trade with this user");
        }
    });
    const realtimeId = DB.insertRealTimeTrade(this.userId, user2Id);

    var user1 = Meteor.users.findOne(this.userId);
    const messageText = `${user1.profile.name} wants to trade with you`;
    const data = {
      alertType: 'realtimeCreated',
      realtimeId,
    };
    DB.addNotification(user2Id, messageText, data);
  },

  acceptRealTimeTrade: function(tradeId) {
    check(tradeId, String);
    var trade = RealTimeTrade.findOne(tradeId);

    //security check
    if(this.userId === trade.user2Id) {
      var channelId = DB.startChat(this.userId, trade.user1Id, Enums.ChatType.TRADE);
      var channel = Channels.findOne(channelId);
      DB.acceptRealTimeTrade(tradeId, channel);

      const messageText = `${trade.user2Name} accepted trade`;
      const data = {
        alertType: 'realtimeAccepted',
        realtimeId: tradeId,
      };
      DB.addNotification(trade.user1Id, messageText, data);
      //start private chat
      return tradeId;
    } else {
      throw new Meteor.Error("SECURITY_ERROR", "You are not authorized to accept this trade");
    }
  },

  rejectRealTimeTrade: function(tradeId) {
    check(tradeId, String);
    var trade = RealTimeTrade.findOne(tradeId);
    //security check
    if(this.userId === trade.user1Id || this.userId === trade.user2Id) {
      DB.rejectRealTimeTrade(tradeId);
      //TODO: BAD CODE! I'm sorry, it's late...
      if(this.userId === trade.user1Id) {
        DB.addNotification(trade.user2Id, trade.user1Name + " rejected trade");
      } else {
        DB.addNotification(trade.user1Id, trade.user2Name + " rejected trade");
      }
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
    return DB.checkForTradeCompletion(tradeId);
  },

  setStatusTrading: function(tradeId) {
    check(tradeId, String);

    var trade = RealTimeTrade.findOne(tradeId);

    // just cancel the trade if someone is already confirmed
    // this state should not be hit, but better to be safe
    if ([ trade.user1Stage, trade.user2Stage ].indexOf('CONFIRMED') > -1) {
      DB.rejectRealTimeTrade(tradeId);
    }

    // Only change stage if the user is currently trading
    if(this.userId === trade.user1Id) {

      if (trade.user1Stage === 'DONE') {
        DB.setTradeStage(tradeId, "user1Stage", "TRADING");
        DB.setTradeStage(tradeId, "user2Stage", "TRADING");
      }

    } else if (this.userId === trade.user2Id)  {

      if (trade.user2Stage === 'DONE') {
        DB.setTradeStage(tradeId, "user1Stage", "TRADING");
        DB.setTradeStage(tradeId, "user2Stage", "TRADING");
      }

    } else {
      throw new Meteor.Error("SECURITY_ERROR", "not authorized");
    }
  },
});
