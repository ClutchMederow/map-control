//all functions here are client side readers
//put in maybe some CSS classes in here?
Transactions = new Mongo.Collection('transactions');

//create transaction with user1 and null user2
//create a market collection as well
//user1Id = user with good on market
//user2Id = person requesting trade
/*
Transactions.attachSchema({
  //TODO: relabel this something like lister / buyer
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
  offerDate: {
    type: Date,
    label: 'When offer was made'
  },
  stage: {
    type: String,
    label: 'Current Stage',
    //may need compound states, i.e. A accepts B rejects
    allowedValues: ['PENDING', 'DECLINED', 'CANCELED', 'ACCEPTED']
  },
  createdTimestamp: {
    type: Date,
    label: 'Internal created timestamp'
  },
  modifiedTimestamp: {
    type: Date,
    label: 'Internal modified timestamp'
  }
});
*/

