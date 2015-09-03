var Future = Npm.require('fibers/future');

// Updates DB during each stage, which will be pushed to the client if appropriate
Task = function(jobs, ordered, taskId, DBLayer) {
  var self = this;

  check(ordered, Boolean);
  check(jobs, Array);
  check(taskId, String);
  check(DBLayer, Object);

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

  // Private fields - will not be serialized
  this._jobs = jobs;
  this._ordered = ordered;
  this._taskId = taskId;

  // We pass in DB here for easy mocking during tests
  this._DB = DBLayer;

  // We are now ready
  this.jobType = Dispatcher.jobType.TASK;
  this.jobId = Random.id();
  this._setStatus(Dispatcher.jobStatus.READY);
};

// Saves all non-private fields in a collection
Task.prototype._save = function() {

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
Task.prototype._setStatus = function(status) {
  this.status = status;
  this._save();
};

Task.prototype.execute = function() {
  var self = this;
  var result;

  this._setStatus(Dispatcher.jobStatus.PENDING);

  try {
    if (self._ordered === true) {
      // Do each job in order
      result = self._executeSerial();
    } else {
      // Do each job in parallel
      result = self._executeParallel();
    }

    if (self.status === Dispatcher.jobStatus.FAILED) {
      throw new Error('CANCELLED');
    }

    self._setStatus(Dispatcher.jobStatus.COMPLETE);
  } catch(e) {
    self.cancel();
    throw e;
  }

  return result;
};

Task.prototype._executeParallel = function() {
  var self = this;
  var allFutures = [];
  var firstError = null;

  // Execute each callback
  _.each(this._jobs, function(job) {
    var thisFut = new Future();
    allFutures.push(thisFut);

    var closedFunc = (function(closedFuture, closedJob) {
      return function() {
        try {

          var res = closedJob.execute()
          closedFuture.return(res);

        } catch(error) {

          if (!firstError) {
            firstError = error;
          }

          closedFuture.throw(error);
        }
      }
    })(thisFut, job);
    console.log(closedFunc);

  //   Meteor.bindEnvironment(Meteor.setTimeout(function() {
  //     if (error) {


  //     } else {

  //       thisFut.return();
  //     }

  //     return;
  //   }, 0))(thisFut);

  //   job.execute();
    Meteor.setTimeout(closedFunc, 0);
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
    self.cancel();
    throw firstError;
  }
};

// TODO: Add some checks that it was successully rolled back
// Possibly ROLLING and FAILED

// Executes each job serially
Task.prototype._executeSerial = function() {
  var self = this;

  // var jobFut = new Future();
  // var index = 0;

  // // Runs the next job in the sequence
  // function getNextOrResolve(error, result) {
  //   if (error) {

  //     // Resolve the future with an error and do not execute any more jobs in the chain
  //     jobFut.throw(error);
  //     return;

  //   } else if (index < self._jobs.length && self.status !== Dispatcher.jobStatus.FAILED) {

  //     // Executes the next job, passing this same function as a callback
  //     self._jobs[index++].execute(getNextOrResolve);

  //   } else {

  //     // If there are no more jobs, resolve the future and exit the loop
  //     jobFut.return();
  //     return;
  //   }
  // }


  _.each(this._jobs, function(job) {
    job.execute();
  });

  // // Call this to kick off the sequence
  // getNextOrResolve();

  // // Wait for the future to be resolved
  // // Will throw if the future.throw is calld
  // jobFut.wait();
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
  this._setStatus(Dispatcher.jobStatus.FAILED);
};
