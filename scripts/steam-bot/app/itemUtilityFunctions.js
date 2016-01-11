var _ = require('underscore');

function addItemUtilityFunctions(items) {
  //searchText is a string
  //fields is an array, e.g. ['type', 'name']
  //selector is an object, e.g. {deleteInd: false}
  //options is an optional object, e.g. {limit: 1000}
  items.getItems = function(searchText, fields, selector, options) {
    return Items.searchFor(selector, searchText, fields, options);
  };

  items.findStashItem = function(itemId) {
    return Items.findOne({ itemId: itemId, status: Enums.ItemStatus.STASH, deleteInd: false });
  };

  // Returns true if all items are in the stash and thus able to be withdrawn
  items.ensureItemsInStash = function(itemIds) {
    var stashItems = Items.find({ itemId: { $in: itemIds } }).fetch();
    _.find(stashItems, function(thisItem) {
      if (thisItem.status !== Enums.ItemStatus.STASH) {
        return false;
      }
    });

    if (itemIds.length !== stashItems.length) {
      return false;
    }

    return true;
  };
};

module.exports = addItemUtilityFunctions;