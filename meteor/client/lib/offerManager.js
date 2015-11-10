OfferManager = function() {
  this.selectedItems = new Mongo.Collection(null);
  this.userInventoryItems = new Mongo.Collection(null);
};

OfferManager.prototype.hasItems = function() {
  return !!this.selectedItems.find().count();
};

OfferManager.prototype.clearSelected = function() {
  this.selectedItems.remove({});
};

OfferManager.prototype.toggleItem = function(item) {
  if (!item) return;

  if (this.selectedItems.findOne(item._id)) {
    this.selectedItems.remove(item._id);
  } else {
    this.selectedItems.insert(item);
  }
};

OfferManager.prototype.execute = function(id, cb) {
  if (this.hasItems()) {
    var offeredItems = this.selectedItems.find().fetch();
    Meteor.call('createOffer', id, offeredItems, cb);
  } else {
    cb(new Meteor.Error('NO_ITEMS', 'Please offer at least one item'));
  }
};
