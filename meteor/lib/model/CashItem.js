CashItem = function() {
  this.open = false;
  this.template = null;
};

CashItem.prototype.init = function(cb) {
  this.completedCallback = cb;
  this.open = true;
};

CashItem.prototype.markAsDone = function(amount) {
  this.completedCallback(amount);
  this.open = false;
};

CashItem.prototype.markAsCancelled = function() {
  Blaze.remove(this.template);
  this.open = false;
};

