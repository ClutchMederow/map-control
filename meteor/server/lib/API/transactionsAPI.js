//basically all functions for transactions are here 
//only thing that touches transactions collection

//Stub API
//Note: userItems are an array of assets Ids
//returns true/false
function initiateTrade(user1Id, user1Items, user2Id, user2Items) {
  return true;
}



TransactionsAPI = (function() {

  var transactionId;
  var stage;
  
  return {
    //First method to call, sets up DB row, returns possible 
    //stages
    initializeTrade: function(user1Id, user1Items, user2Id, user2Items, stage) {
      stage = "INITIAL_OFFER";
      transactionId = Transactions.initialize(user1Id, user1Items, user2Id, user2Items, stage);
      //send notification to player
    },
    acceptTrade: function() {
      //try and execute trade
      var status = initiateTrade();
      if(status === TradeStatus.success) {
        //notify users of success
        //dispatcher will have changed Inventory collection
      } else {
        //notify users of failure
      }
      stage = 'ACCEPTED';
      Transactions.changeStage(transactionId, stage);
    }, 
    declineTrade: function() {
      stage = 'DECLINED';
      Transactions.changeStage(stage);
    },
    cancelTrade: function() {
      stage = 'CANCELED';
      Transactions.changeStage(stage);
    }
  };
})();
