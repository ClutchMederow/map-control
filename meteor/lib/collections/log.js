Log = new Mongo.Collection('log');

Log.attachSchema({
  userId: {
    type: String,
    label: 'User id'
  },
  logDate: {
    type: Date,
    label: 'Date of logged event'
  },
  logType: {
    type: String,
    label: 'Type of logged event',
    allowedValues: ['credit', 'debit', 'trade']
  },
  items: {
    type: [String],
    label: 'Asset Ids of traded items',
    optional: true
  },
  amount: {
    type: Number,
    label: 'Amount of ironBucks or cash',
    optional: true 
  },
  currency: {
    type: String,
    label: 'amount type',
    allowedValues: ['USD', 'ironBucks']
  }
});
