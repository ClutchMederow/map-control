var userInventoryItems = new Mongo.Collection(null);
var selectedItems;

Template.addRemoveStash.helpers({
  inventoryOptions: function() {
    return {
      title: 'Inventory',
      items: userInventoryItems.find({ tradable: 1 }).fetch(),
      columns: '3',
      class: 'add-remove-items',
      selectedItems: selectedItems
    };
  },

  stashOptions: function() {
    var userId = Meteor.userId();

    return {
      title: 'Stash',
      items: Items.find({ userId: userId, status: Enums.ItemStatus.STASH, deleteInd: false }).fetch(),
      columns: '3',
      class: 'add-remove-items',
      selectedItems: selectedItems
    };
  }
});

Template.addRemoveStash.onCreated(function() {
  userInventoryItems.remove({});
  selectedItems = this.data.selectedItems;

  // Remove in case the go back from confirm page - the API items will have new ids
  selectedItems.remove({});

  Meteor.call('getPlayerInventory', function(err, res) {
    if (err) {
      console.log(err);
    } else {
      _.each(res, function(item) {
        userInventoryItems.insert(item);
      });
    }
  });
});

Template.addRemoveStash.events({
  'click #withdraw-div .contained-item': function() {
    toggleItem(this, Enums.TransType.WITHDRAW);
  },

  'click #deposit-div .contained-item': function() {
    toggleItem(this, Enums.TransType.DEPOSIT);
  }
});

function toggleItem(item, transType) {
  if (!transType || !item) return;

  item.transType = transType;

  if (selectedItems.findOne(item._id)) {
    selectedItems.remove(item._id);
  } else {
    selectedItems.insert(item);
  }
}