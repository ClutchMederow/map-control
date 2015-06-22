TradeRequest = new Mongo.Collection('tradeRequest');

TradeRequest.attachSchema({
  userId: {
    type: String,
    label: 'UserId'
  },
  userProfile: {
    type: Object,
    label: 'denormalized user profile for easy refernece'
  },
  items: {
    type: [Object],
    label: '1 or more items for trade OR cash',
    optional: true
  },
  request: {
    type: [Object],
    label: 'Desired items or cash',
    optional: true
  },
  //Offers are completely denormalized,
  //they don't exist outside a trade request
  //TODO: specify details of offers 
  offers: {
    type: [Object],
    label: 'Offers',
    optional: true
  }, 
  datePosted: {
    type: Date,
    label: 'Date trade request posted'
  },
  notes: {
    type: String,
    label: 'Notes on request',
    optional: true
  },
  closeDate: {
    type: Date,
    label: 'Date trade request closed',
    optional: true
  },
  closeReason: {
    type: String,
    label: 'Reason TradeRequest closed',
    allowedValues: ['Trade completed','No offers', 'Decided to keep item', 'Etc..'],
    optional: true
  }
});