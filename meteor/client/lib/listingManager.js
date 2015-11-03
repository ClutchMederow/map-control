ListingManager = function() {
  this.myItems = new Mongo.Collection(null);
  this.theirItems = new Mongo.Collection(null);
  this.inProgress = new ReactiveVar(false);
};

ListingManager.prototype.hasMyItems = function() {
  return !!this.myItems.find().count();
};

ListingManager.prototype.hasTheirItems = function() {
  return !!this.theirItems.find().count();
};

ListingManager.prototype.clearSelected = function() {
  this.myItems.remove({});
  this.theirItems.remove({});
};

ListingManager.prototype.clearMySelected = function() {
  this.myItems.remove({});
};

ListingManager.prototype.clearTheirSelected = function() {
  this.theirItems.remove({});
};

ListingManager.prototype.toggleMyItem = function(item) {
  if (!item) return;

  if (this.myItems.findOne(item._id)) {
    this.myItems.remove(item._id);
  } else {
    this.myItems.insert(item);
  }
};

ListingManager.prototype.toggleTheirItem = function(item) {
  if (!item) return;

  if (this.theirItems.findOne(item._id)) {
    this.theirItems.remove(item._id);
  } else {
    this.theirItems.insert(item);
  }
};

ListingManager.prototype.execute = function(cb) {
  var self = this;

  if (!this.hasMyItems() && !this.hasTheirItems()) {
    cb(new Meteor.Error('NO_ITEMS', 'Please include at least one item'));
  } else {
    self.inProgress.set(true);
    Meteor.call('createListing', self.myItems.find().fetch(), self.theirItems.find().fetch(), function(error) {
      self.clearSelected();
      self.inProgress.set(false);
      cb(error);
    });
  }
};
