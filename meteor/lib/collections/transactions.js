//all functions here are client side readers
//put in maybe some CSS classes in here?
Transactions = new Mongo.Collection('transactions');

//create transaction with user1 and null user2
//create a market collection as well
//user1Id = requesting items from user2Id
//user1Id = customer
//user2Id = vendor
Transactions.attachSchema({
  user1Id: {
    type: String,
    label: 'User 1'
  }, 
  user1Items: {
    type: [Object],
    label: 'Items of User 1 in trade',
    blackbox: true
  },
  user2Id: {
    type: String,
    label: 'User B'
  },
  user2Items: {
    type: [Object],
    label: 'Items of User 2 in trade',
    blackbox: true
  },
  stage: {
    type: String,
    label: 'Current Stage',
    //may need compound states, i.e. A accepts B rejects
    allowedValues: ['INITIAL_OFFER', 'DECLINED', 'CANCELED', 'ACCEPTED'] 
  }
});

Transactions.initialize = function(user1Id, user1Items, user2Id, user2Items, stage) {
  return Transactions.insert({user1Id: user1Id, 
                             user1Items: user1Items,
                             user2Id: user2Id,
                             user2Items: user2Items,
                             stage: stage});
};

Transactions.changeStage = function(transactionId, stage) {
  return Transactions.update(transactionId, {$set: {stage: stage}});
};

//update the inventory items after transaction inserted
Transactions.after.insert(function(userId, doc) {
  _.each(doc.user1Items, function(item) {
    InventoryItems.update({_id: item._id}, {$push: {currentTransactions: doc}});
  }); 

  _.each(doc.user2items, function(item) {
    InventoryItems.update({_id: item._id}, {$push: {currentTransactions: doc}});
  });
});
