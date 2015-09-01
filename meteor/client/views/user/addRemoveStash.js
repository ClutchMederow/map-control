var userInventoryItems = new Mongo.Collection(null);
var selectedItems = new Mongo.Collection(null);

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
      items: Items.find({ userId: userId, status: Enums.ItemStatus.STASH }).fetch(),
      columns: '3',
      class: 'add-remove-items',
      selectedItems: selectedItems
    };
  }
});

Template.addRemoveStash.onCreated(function() {
  userInventoryItems.remove({});
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
  'click #add-remove-row .contained-item': function() {
    if (selectedItems.findOne(this._id)) {
      selectedItems.remove(this._id);
    } else {
      selectedItems.insert({ _id: this._id });
    }
  }
});