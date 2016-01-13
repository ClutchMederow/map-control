TradeJob = function(itemId, newUserId, taskId, DBLayer) {
  check(itemId, String);
  check(userId, String);
  check(DBLayer, Object);

  // Public members - will be serialized
  this.itemId = itemId;
  this.newUserId = newUserId;
  this.jobId = Random.id();

  // Private members - will not be serialized
  this._DB = DBLayer;
  this._taskId = taskId;

  // Save the old owner
  this.oldUserId = this._DB.items.getItemOwner(this.itemId)._id;

  // My body is ready
  this._setStatus(Dispatcher.jobStatus.READY);
};

// Doesn't need to be asynchronous - should be instant
TradeJob.prototype.execute = function(callback) {
  this._setStatus(Dispatcher.jobStatus.PENDING);
  try {
    var res = this._DB.items.reassignOwner(this.itemId, this.newUserId);
    this._setStatus(Dispatcher.jobStatus.COMPLETE);
    callback(null, res);
  } catch(e) {
    this.error = e.message;
    this._setStatus(Dispatcher.jobStatus.FAILED);
    callback(e);
  }
};

// Only need to roll it back if it is complete
TradeJob.prototype.cancel = function() {
  if (this.jobStatus === Dispatcher.jobStatus.COMPLETE) {
    try {
      this._DB.items.reassignOwner(this.itemId, this.oldUserId);
    } catch(e) {
      this.rollbackError = e.message;
      this._setStatus(Dispatcher.jobStatus.ROLLBACK_FAILED);
    }
  }
};

// Saves all non-private fields in a collection
TradeJob.prototype._save = function() {

  function replacer(key, value) {
    if (key.charAt(0) === '_')
      return undefined;
    else
      return value;
  }

  // The parse + stringify combo gets rid of all functions and _ prefixed fields
  var doc = JSON.parse(JSON.stringify(this, replacer));
  this._DB.tasks.updateJobHistory(this._taskId, doc);
};

// Set the status and push an update to the task
TradeJob.prototype._setStatus = function(status) {
  this.status = status;
  this._save();
};
