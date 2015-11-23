OfferManager = function() {
  this.selectedItems = new Mongo.Collection(null);
  this.userInventoryItems = new Mongo.Collection(null);
  this.currentCash = new CashItem();
};

OfferManager.prototype.hasItems = function() {
  return !!this.selectedItems.find().count();
};

OfferManager.prototype.clearSelected = function() {
  this.selectedItems.remove({});
};

OfferManager.prototype.toggleItem = function(item, target) {
  if (!item) return;

  if (this.selectedItems.findOne(item._id)) {
    this.selectedItems.remove(item._id);
  } else {
    if (item.name === IronBucks.name) {
      this.clickBucks(item, target);
    } else {
      this.selectedItems.insert(item);
    }
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

// Dry this out - there is another version in realtimetrading.js
OfferManager.prototype.clickBucks = function(item, target) {
  var self = this;

  if (this.currentCash.open) return;

  this.currentCash.init(function(amount) {
    var cashItem = _.extend({}, item);
    cashItem.amount = amount;

    self.selectedItems.insert(cashItem);
    Blaze.remove(this.template);
  });

  this.currentCash.template = Blaze.renderWithData(Template.ironbucksPicker, { currentCash: this.currentCash }, target.parentNode);
};
