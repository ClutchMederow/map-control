//listings, real time trades, etc. all create transactions
//transactions then execute when both parties agree
//this happens automatically in collection hook
Meteor.methods({
  
  initializeTrade: function(user1Id, user1Items, user2Id, user2Items){
    check(user1Id, String);
    check(user1Items, [Object]);
    check(user2Id, String);
    check(user2Items, [Object]);

    Transactions.initialize(user1Id, user1Items, user2Id, user2Items);
  },

  acceptOffer: function(transactionId) {
    check(transactionId, String);
    var trans = Transactions.findOne(transactionId);   
    if(this.userId === trans.user1Id) {
      Transactions.update({_id: transactionId}, {$set: {user1Accept: true}});
    } else if(this.userId === trans.user1Id) {
      Transactions.update({_id: transactionId}, {$set: {user2Accept: true}});
    } else {
      throw new Meteor.Error("SECURITY_ERROR", "attempted to update incorrect transaction");
    }

    if(trans.user1Accept && trans.user2Accept) {
      Transactions.changeStage(transactionId, Enums.TransStage.ACCEPTED);
    }
  },

  rejectOffer: function(transactionId) {
    check(transactionId, String);
    var trans = Transactions.findOne(transactionId);   
    if(this.userId === trans.userId1 || this.userId === trans.userId2) {
      Transactions.changeStage(transactionId, Enums.TransStage.DECLINED);
    }
  }

});
