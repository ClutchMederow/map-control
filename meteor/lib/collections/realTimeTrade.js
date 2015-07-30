RealTimeTrade = new Mongo.Collection('realtimetrade');

//TODO: make all string values enums
RealTimeTrade.attachSchema({
  user1Id: {
    type: String,
    label: 'User 1'
  }, 
  user1Items: {
    type: [Object],
    label: 'Items of User 1 in trade',
    optional: true,
    blackbox: true
  },
  user2Id: {
    type: String,
    label: 'User B'
  },
  user2Items: {
    type: [Object],
    label: 'Items of User 2 in trade',
    optional: true,
    blackbox: true
  },
  user1Stage: {
    type: String,
    label: 'Current stage of user 2',
    allowedValues: ['TRADING', 'DONE', 'CONFIRMED']
  },
  user2Stage: {
    type: String,
    label: 'Current stage of user 2',
    allowedValues: ['TRADING', 'DONE', 'CONFIRMED']
  },
  transactionId: {
    type: String,
    label: 'associated transaction',
    optional: true
  },
  closeDate: {
    type: Date,
    label: 'date',
    optional: true
  },
  closeReason: {
    type: String,
    label: 'reason real time trade was closed',
    allowedValues: ['NOT_ACCEPTED', 'FAILED_TRADE', 'ACCEPTED'],
    optional: true
  }
});
