//basically all functions for transactions are here 
//only thing that touches transactions collection
TransactionsAPI = (function() {

  var transaction; 
  
  var getCurrentStage = function() {

  };
  
  return {
    moveStage: function(transactionId, currentStage, possibleStages) {
      return true;
    },
    getNextPossibleStages: function(transactionId) {
      return true;
    }
  };
})();
