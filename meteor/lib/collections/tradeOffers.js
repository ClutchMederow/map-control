TradeOffers = new Mongo.Collection('tradeOffers');

TradeOffers.attachSchema({
  userId: {
    type: String,
    label: 'UserId'
  },

  userProfile: {
    type: Object,
    label: 'denormalized user profile for easy refernece'
  },

  offerDate: {
    type: Date,
    label: 'Date that the user made the offer'
  },

  direction: {
    type: String,
    allowedValues: ['received','sent'],
    label: 'Direction of the trade offer'
  },

  tradeofferid: {
    label: 'a unique identifier for the trade offer',
    type: String
  },

  accountid_other: {
    type: Number,
    label: 'your partner in the trade offer'
  },

  message: {
    type: Number,
    label: 'a message included by the creator of the trade offer'
  },

  expiration_time: {
    type: Number,
    label: 'unix time when the offer will expire (or expired, if it is in the past)'
  },

  trade_offer_state: {
    type: String,
    label: 'see ETradeOfferState above'
  },

  items_to_give: {
    type: [Number],
    label: 'array of CEcon_Asset, items you will give up in the trade (regardless of who created the offer)'
  },

  items_to_receive: {
    type: [Number],
    label: 'array of CEcon_Asset, items you will receive in the trade (regardless of who created the offer)'
  },

  is_our_offer: {
    type: Boolean,
    label: 'boolean to indicate this is an offer you created.'
  },

  time_created: {
    type: Number,
    label: 'unix timestamp of the time the offer was sent'
  },

  time_updated: {
    type: Number,
    label: 'unix timestamp of the time the trade_offer_state last changed.'
  },

  from_real_time_trade: {
    type: Boolean,
    label: 'boolean to indicate this is an offer automatically created from a realtime trade'
  }
});