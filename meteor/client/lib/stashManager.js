var stashConfigAlert = {
  timeout: 0,
  html: true,
  onRouteClose: false
};

StashManager = function() {
  this.selectedItems = new Mongo.Collection(null);
  this.userInventoryItems = new Mongo.Collection(null);
  this.invReady = new ReactiveVar(false);
  this.invError = new ReactiveVar(null);

  this.refresh();
};

StashManager.prototype.execute = function() {
  var deposits = _.pluck(this.selectedItems.find({ transType: Enums.TransType.DEPOSIT }, { fields: { itemId: 1, _id: 0 } }).fetch(), 'itemId');
  var withdrawals = _.pluck(this.selectedItems.find({ transType: Enums.TransType.WITHDRAW }, { fields: { itemId: 1, _id: 0 } }).fetch(), 'itemId');

  if (deposits.length) {
    depositItems(deposits);
  }

  if (withdrawals.length) {
    withdrawItems(withdrawals);
  }
};

StashManager.prototype.hasItems = function() {
  return !!this.selectedItems.find().count();
};

StashManager.prototype.clearSelected = function() {
  this.selectedItems.remove({});
};

StashManager.prototype.refresh = function() {
  var self = this;

  // Remove in case the go back from confirm page - the API items will have new ids
  this.selectedItems.remove({});
  this.userInventoryItems.remove({});

  Meteor.call('getPlayerInventory', function(err, res) {
    if (err) {
      self.invError.set(err);
      sAlert.error(err.reason);
    } else {
      self.invError.set(null);
      _.each(res, function(item) {
        self.userInventoryItems.insert(item);
      });
    }

    self.invReady.set(true);
  });
};

StashManager.prototype.toggleItem = function(item, transType) {
  if (!transType || !item) return;

  item.transType = transType;

  if (this.selectedItems.findOne(item._id)) {
    this.selectedItems.remove(item._id);
  } else {

    if (item.tradable) {
      this.selectedItems.insert(item);
    } else {
      sAlert.warning('That item is not tradable');
    }
  }
};

StashManager.prototype.getInvError = function() {
  return this.invError.get();
};

function depositItems(deposits) {
  Meteor.call('depositItems', deposits, function(err, res) {
    if (err) {
      sAlert.error(err);
    }
  });
}

function withdrawItems(withdrawals) {
  Meteor.call('withdrawItems', withdrawals, function(err, res) {
    if (err) {
      sAlert.error(err);
    } 
  });
}
