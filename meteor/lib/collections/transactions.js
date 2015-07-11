//all functions here are client side readers
//put in maybe some CSS classes in here?
Transactions = new Mongo.Collection('transactions');

Transactions.attachSchema({
  userId1: {
    type: String,
    label: 'User A'
  }, 
  userId2: {
    type: String,
    label: 'User B'
  },
  stage: {
    type: String,
    label: 'Current Stage',
    allowedValues: ['INITIAL_OFFER'] //may need compound states, i.e. A accepts B rejects
  }
});
