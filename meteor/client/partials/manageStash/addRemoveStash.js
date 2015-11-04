Template.addRemoveStash.helpers({
  inventoryOptions: function() {
    var stashManager = this.stashManager;

    return {
      title: 'Inventory',
      items: stashManager.userInventoryItems.find({ marketable: 1 }).fetch(),
      columns: '3',
      class: 'add-remove-items',
      selectedItems: stashManager.selectedItems,
      ready: stashManager.invReady.get()
    };
  },

  stashOptions: function() {
    var userId = Meteor.userId();
    var stashManager = this.stashManager;

    return {
      title: 'Stash',
      items: Items.find({ userId: userId, status: Enums.ItemStatus.STASH, deleteInd: false, name: { $ne: IronBucks.name } }).fetch(),
      columns: '3',
      class: 'add-remove-items',
      selectedItems: stashManager.selectedItems,
      ready: true
    };
  }
});
