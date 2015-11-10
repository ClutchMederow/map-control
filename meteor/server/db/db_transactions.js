DB.transactions = {
  insert: function(doc) {
    // check(doc, {
    //   user1Id: String,
    //   user1Items: Match.Any,
    //   user2Id: String,
    //   user2Items: Match.Any,
    //   stage: _.values(Enums.TransStage),
    //   user1Accept: Boolean,
    //   user2Accept: Boolean
    // });

    doc.createdTimestamp = new Date();
    doc.modifiedTimestamp = new Date();

    return Transactions.insert(doc);
  },

  update: function(selector, doc) {
    doc.modifiedTimestamp = new Date()
    Transactions.update(selector, doc);
  },

  initialize: function(user1Id, user1Items, user2Id, user2Items) {
    return DB.transactions.insert({
      user1Id: user1Id,
      user1Items: user1Items,
      user2Id: user2Id,
      user2Items: user2Items,
      stage: Enums.TransStage.PENDING,
      user1Accept: false,
      user2Accept: false
    });
  },

  changeStage: function(transactionId, stage) {
    var selector = { _id: transactionId };

    return DB.transactions.update(selector, {
      $set: {
        stage: stage
      }
    });
  },
};


// //update the inventory items after transaction inserted
// Transactions.after.insert(function(userId, doc) {
//   _.each(doc.user1Items, function(item1) {
//     Items.update({_id: item1._id}, {$push: {currentTransactions: doc._id}});
//   });

//   _.each(doc.user2Items, function(item2) {
//     Items.update({_id: item2._id}, {$push: {currentTransactions: doc._id}});
//   });
// });

Transactions.after.update(function(userId, doc, fieldNames, modifier, option) {
  //if the transaction is not pending, remove transaction from list attached to
  // an item
  if(_.contains(fieldNames, "stage") && (doc.stage === Enums.TransStage.ACCEPTED)) {
    TradeHelper.executeTrade(doc);
    TradeHelper.removeItemsInTransaction(doc);
  } else if (_.contains(fieldNames, "stage") && (doc.stage === Enums.TransStage.CANCELED)) {
    TradeHelper.removeItemsInTransaction(doc);
  } else if (_.contains(fieldNames, "stage") && (doc.stage === Enums.TransStage.DECLINED)) {
    TradeHelper.removeItemsInTransaction(doc);
  } else {
    if(_.contains(fieldNames, "stage") && (doc.stage !== Enums.TransStage.PENDING)) {
      throw new Meteor.ERROR("LOGICAL_ERROR", 'this is invalid state');
    }
  }
});
