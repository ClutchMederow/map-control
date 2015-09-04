var stashConfigAlert = {
  timeout: 0,
  html: true,
  onRouteClose: false
};

StashManager = function() {
  this.selectedItems = new Mongo.Collection(null);
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

function depositItems(deposits) {
  Meteor.call('depositItems', deposits, function(err, res) {
    if (err) {
      sAlert.error(err);
    } else {
      var message = '<a href="' + Constants.tradeOfferURL + res + '/" target="_blank" class="trade-alert">Click here to accept your trade request</a>'
      sAlert.success(message, stashConfigAlert);
    }
  });
}

function withdrawItems(withdrawals) {
  Meteor.call('withdrawItems', deposits, function(err, res) {
    if (err) {
      sAlert.error(err);
    } else {
      var message = '<a href="' + Constants.tradeOfferURL + res + '/" target="_blank" class="trade-alert">Click here to accept your trade request</a>'
      sAlert.success(message, stashConfigAlert);
    }
  });
}