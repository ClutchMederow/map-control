Items = new Mongo.Collection('items');

Items.attachSchema({
  userId: {
    type: String,
    label: "user Id"
  },
  botName: {
    type: String,
    label: "bot that holds item",
    optional: true //TODO: remove
  },
  currentTransactions: {
    type: [String],
    label: 'Open transactions that involve this item',
    blackbox: true,
    optional: true
  },
  name: {
    type: String,
    label: 'Item Name'
  },
  nameColor: {
    type: String,
    label: 'Item Color',
    optional: true
  },
  backgroundColor: {
    type: String,
    label: 'Background Color',
    optional: true
  },
  type: {
    type: String,
    label: 'Item Category'
  },
  descriptions: {
    type: [Object],
    label: 'Item Description',
    blackbox: true,
    optional: true
  },
  tags: {
    type: [Object],
    label: 'Item Tags',
    blackbox: true,
    optional: true
  },
  itemId: {
    type: String,
    label: 'Steam ID of item'
  },
  amount: {
    type: Number,
    label: 'Quantity of Item'
  },
  marketable: {
    type: Number,
    label: 'Is item marketable?',
    allowedValues: [0,1]
  },
  tradable: {
    type: Number,
    label: 'Is item tradable',
    allowedValues: [0,1]
  },
  classId: {
    type: String,
    label: 'Steam class ID of item'
  },
  instanceId: {
    type: String,
    label: 'Steam instance id of item'
  },
  iconURL: {
    type: String,
    label: 'icon url of image',
    optional: true
  },
  tradeofferId: {
    type: String,
    label: 'Tradeoffer ID'
  },
  status: {
    type: String,
    label: 'Item status'
  },
  deleteInd: {
    type: Boolean,
    label: 'logical deletion'
  }
});
//Attach Search to Collections
Items.searchFor = SearchFunctions.searchFor;
Items.searchForOne = SearchFunctions.searchForOne;

//searchText is a string
//fields is an array, e.g. ['type', 'name']
//selector is an object, e.g. {deleteInd: false}
//options is an optional object, e.g. {limit: 1000}
Items.getItems = function(searchText, fields, selector, options) {
  return Items.searchFor(selector, searchText, fields, options);
};

