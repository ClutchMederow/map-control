//basically all functions for transactions are here 
//only thing that touches transactions collection

//Stub API
function takeItems(items) {
  return true;
}

function giveItems(items) {
  return true;
}

function returnItems(offerId) {
  return true;
}

function queryOffer(offerId) {
  return true;
}
function cancelOffer(offerId) {
  return true;
}

TransactionsAPI = (function() {

  var transactionId;
  var stage;
  
  var getCurrentStage = function() {
    return stage;
  };
  
  return {
    //First method to call, sets up DB row, returns possible 
    //stages
    initializeTrade: function(user1Id, user1Items, user2Id, user2Items, stage) {
      stage = "INITIAL_OFFER";
      transactionId = Transactions.initialize(user1Id, user1Items, user2Id, user2Items, stage);
      //send notification to player
    },
    acceptTrade: function() {
      
    }, 
    declineTrade: function() {

    },
    rejectTrade: function() {

    }
  };
})();
