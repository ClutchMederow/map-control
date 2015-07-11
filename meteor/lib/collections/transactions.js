//all functions here are client side readers
//put in maybe some CSS classes in here?
Transactions = new Mongo.Collection('transactions');

//create transaction with user1 and null user2
//create a market collection as well
Transactions.attachSchema({
  user1Id: {
    type: String,
    label: 'User 1'
  }, 
  user1Items: {
    type: [Object],
    label: 'Items of User 1 in trade'
  },
  user2Id: {
    type: String,
    label: 'User B'
  },
  user2Items: {
    type: [Object],
    label: 'Items of User 2 in trade'
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
