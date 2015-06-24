InventoryItems = new Mongo.Collection('inventoryItems');

InventoryItems.attachSchema({
  name: {
    type: String,
    label: 'Item Name'
  },
  type: {
    type: String,
    label: 'Item Category'
  },
  tags: {
    type: [Object],
    label: 'Item Tags',
    optional: true
  },
  itemId: {
    type: String,
    label: 'Steam ID of item'
  }, 
  classId: {
    type: String,
    label: 'Steam class ID of item'
  },
  iconURL: {
    type: String,
    label: 'icon url of image',
    optional: true
  },
  deleteInd: {
    type: Boolean,
    label: 'logical deletion'
  }
});
//Attach Search to Collections
InventoryItems.searchFor = searchFor;
InventoryItems.searchForOne = searchForOne;

//searchText is a string
//fields is an array, e.g. ['type', 'name']
//selector is an object, e.g. {deleteInd: false}
//options is an optional object, e.g. {limit: 1000}
InventoryItems.getItems = function(searchText, fields, selector, options) {
  return InventoryItems.searchFor(selector, searchText, fields, options);
};

