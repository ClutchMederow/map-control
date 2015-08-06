var Future = Npm.require('fibers/future');

// Updates DB during each stage, which will be pushed to the client if appropriate
Task = function(jobs, ordered) {
  var self = this;

  check(ordered, Boolean);
  check(jobs, Array);

  // Since JS doesn't have interfaces, this will have to do
  // All jobs must have the properties defined below
  check(jobs, Match.Where(function() {
    _.each(jobs, function(job) {
      if (typeof job.execute !== 'function')
        return false;

      if (typeof job.status !== 'string')
        return false;

      if (typeof job.cancel !== 'function')
        return false;

      if (typeof job.jobId !== 'string')
        return false;
    });

    return true;
  }));

  if (!(jobs.length > 0))
    throw new Error('Bad number of jobs passed to task');

  this._jobs = jobs;
  this._ordered = ordered;

  this.jobId = Math.round(Math.random()*1000); //////// ----------------------------------THIS NEEDS TO ACTUALLY COME FROM INSERTION INTO A COLLECTION

  // We are now ready
  this.status = Dispatcher.jobStatus.READY;
};

Task.prototype.execute = function(callback) {
  this.status = Dispatcher.jobStatus.PENDING;
  var self = this;

  function syncFunc() {
    try {
      if (self._ordered === true) {
        // Do each job in order
        self._executeSerial();
      } else {
        // Do each job in parallel
        self._executeParallel();
      }

      if (self.status === Dispatcher.jobStatus.FAILED)
        throw new Error('CANCELLED');

      self.status = Dispatcher.jobStatus.COMPLETE;
      callback(null);
    } catch(e) {
      self.cancel();
      callback(e);
    }
  }

  Meteor.setTimeout(syncFunc, 0);
  return;
};

Task.prototype._executeParallel = function() {
  var self = this;
  var allFutures = [];
  var firstError = null;

  // Execute each callback
  _.each(this._jobs, function(job) {
    var thisFut = new Future();
    allFutures.push(thisFut);

    job.execute(function(error, result) {
      if (error) {

        if (!firstError)
          firstError = error;

        // Just to be sure it doesn't block
        Meteor.setTimeout(self.cancel, 0);
        thisFut.throw(error);

      } else {

        thisFut.return();
      }

      return;
    });
  });

  // Wait here until all futures have thrown or resovled
  // Will NOT throw if any futures called throw()
  Future.wait(allFutures);

  // Throws an error if any of the futures errored
  // We want to throw the first error that occured (which may not be the first error in the each block)
  try {
    _.each(allFutures, function(fut) {
      fut.get();
    });
  } catch(e) {
    throw firstError;
  }
};

// TODO: Add some checks that it was successully rolled back
// Possibly ROLLING and FAILED

// Executes each job serially
Task.prototype._executeSerial = function() {
  var self = this;

  var jobFut = new Future();
  var index = 0;

  // Runs the next job in the sequence
  function getNextOrResolve(error, result) {
    if (error) {

      // Resolve the future with an error and do not execute any more jobs in the chain
      jobFut.throw(error);
      return;

    } else if (index < self._jobs.length && self.status !== Dispatcher.jobStatus.FAILED) {

      // Executes the next job, passing this same function as a callback
      self._jobs[index++].execute(getNextOrResolve);

    } else {

      // If there are no more jobs, resolve the future and exit the loop
      jobFut.return();
      return;
    }
  }

  // Call this to kick off the sequence
  getNextOrResolve();

  // Wait for the future to be resolved
  // Will throw if the future.throw is calld
  jobFut.wait();
};

// TODO: figure out how this will interact with the observe callback
Task.prototype.cancel = function() {
  var self = this;

  // Only cancel if completed or pending, otherise do nothing
  if (this.status !== Dispatcher.jobStatus.FAILED) {

    // cancels and rolls back each parallel job
    _.each(this._jobs, function(job) {

      // Prevents this from being called further up the chain
      if (job.status !== Dispatcher.jobType.FAILED)
        job.cancel();
    });
  }

  // Ensures all synchronous jobs get cancelled
  this.status = Dispatcher.jobStatus.FAILED;
};
