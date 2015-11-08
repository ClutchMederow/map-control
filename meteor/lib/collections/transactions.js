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
    allowedValues: ['INITIAL_OFFER', 'DECLINED', 'CANCELED', 'ACCEPTED']
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

Transactions.initialize = function(user1Id, user1Items, user2Id, user2Items) {
  return Transactions.insert({user1Id: user1Id,
                             user1Items: user1Items,
                             user2Id: user2Id,
                             user2Items: user2Items,
                             stage: Enums.TransStage.PENDING ,
                             user1Accept: false,
                             user2Accept: false
                            });
};

Transactions.changeStage = function(transactionId, stage) {
  return Transactions.update(transactionId, {$set: {stage: stage}});
};

//update the inventory items after transaction inserted
Transactions.after.insert(function(userId, doc) {
  _.each(doc.user1Items, function(item1) {
    Items.update({_id: item1._id}, {$push: {currentTransactions: doc._id}});
  });

  _.each(doc.user2Items, function(item2) {
    Items.update({_id: item2._id}, {$push: {currentTransactions: doc._id}});
  });
});

Transactions.after.update(function(userId, doc, fieldNames, modifier, option) {
  //if the transaction is not pending, remove transaction from list attached to
  // an item
  if(_.contains(fieldNames, "stage") && (doc.stage === Enums.TransStage.ACCEPTED)) {
    executeTrade(doc); 
    removeItemsInTransaction(doc);
  } else if (_.contains(fieldNames, "stage") && (doc.stage === Enums.TransStage.CANCELED)) {
    removeItemsInTransaction(doc);
  } else if (_.contains(fieldNames, "stage") && (doc.stage === Enums.TransStage.DECLINED)) {
    removeItemsInTransaction(doc);
  } else {
    if(_.contains(fieldNames, "stage") && (doc.stage !== Enums.TransStage.PENDING)) {
      throw new Meteor.ERROR("LOGICAL_ERROR", 'this is invalid state');
    }
  }
});
