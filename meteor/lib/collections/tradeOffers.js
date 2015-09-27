Tradeoffers = new Mongo.Collection('tradeoffers');

// Tradeoffers.attachSchema({
//   direction: {
//     type: String,
//     allowedValues: ['received','sent'],
//     label: 'Direction of the trade offer',
//     optional: true
//   },

//   tradeofferid: {
//     label: 'a unique identifier for the trade offer',
//     type: String
//   },

//   accountid_other: {
//     type: String,
//     label: 'your partner in the trade offer',
//     optional: true
//   },

//   message: {
//     type: String,
//     label: 'a message included by the creator of the trade offer',
//     optional: true
//   },

//   expiration_time: {
//     type: String,
//     label: 'unix time when the offer will expire (or expired, if it is in the past)',
//     optional: true
//   },

//   trade_offer_state: {
//     type: String,
//     label: 'see ETradeOfferState above',
//     optional: true
//   },

//   items_to_give: {
//     type: [Object],
//     label: 'array of CEcon_Asset, items you will give up in the trade (regardless of who created the offer)',
//     blackbox: true,
//     optional: true
//   },

//   items_to_receive: {
//     type: [Object],
//     label: 'array of CEcon_Asset, items you will receive in the trade (regardless of who created the offer)',
//     blackbox: true,
//     optional: true
//   },

//   is_our_offer: {
//     type: Boolean,
//     label: 'boolean to indicate this is an offer you created.',
//     optional: true
//   },

//   time_created: {
//     type: Number,
//     label: 'unix timestamp of the time the offer was sent',
//     optional: true
//   },

//   time_updated: {
//     type: String,
//     label: 'unix timestamp of the time the trade_offer_state last changed.',
//     optional: true
//   },

//   from_real_time_trade: {
//     type: Boolean,
//     label: 'boolean to indicate this is an offer automatically created from a realtime trade',
//     optional: true
//   },

//   deleteInd: {
//     type: Boolean,
//     label: 'delete ind'
//   },

//   botName: {
//     type: String,
//     label: 'Bot name'
//   },

//   jobType: {
//     type: String,
//     label: 'Type of job'
//   },

//   taskId: {
//     type: String,
//     label: 'Task ID'
//   },

//   createdTimestamp: {
//     type: Date,
//     label: 'Internal created timestamp'
//   },

//   modifiedTimestamp: {
//     type: Date,
//     label: 'Internal modified timestamp'
//   }
// });