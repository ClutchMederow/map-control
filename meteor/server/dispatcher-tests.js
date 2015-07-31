// Completes after 3 seconds
var job1 = {
  execute: function(callback) {
    console.log('2. job begin (job1)');
    console.log(task.status)

    var self = this;
    this.status = Dispatcher.jobStatus.PENDING;

    self.timeoutId = Meteor.setTimeout(function() {
      self.status = Dispatcher.jobStatus.COMPLETE;

      console.log('3. complete (job1)');
      console.log(task.status);

      callback();
    }, 3000);
  },

  status: Dispatcher.jobStatus.READY,

  cancel: function() {
    var self = this;
    Meteor.clearTimeout(self.timeoutId);
    console.log('cancelled (job1)');
  },

  jobName: 'job1',

  jobId: 1
};

// Completes after 1 second
var job2 = {
  execute: function(callback) {
    console.log('2. job begin (job2)');
    console.log(task.status)

    var self = this;
    this.status = Dispatcher.jobStatus.PENDING;

    Meteor.setTimeout(function() {
      self.status = Dispatcher.jobStatus.COMPLETE;

      console.log('3. complete (job2)');
      console.log(task.status);

      callback();
    }, 1000);
  },

  status: Dispatcher.jobStatus.READY,

  cancel: function() {
    console.log('cancelled (job2)');
  },

  jobName: 'job1',

  jobId: 2
};

// Fails after 1 second
var job3 = {
  execute: function(callback) {
    console.log('2. job begin (job3)');
    console.log(task.status)

    var self = this;
    this.status = Dispatcher.jobStatus.PENDING;

    Meteor.setTimeout(function() {
      self.status = Dispatcher.jobStatus.FAILED;

      console.log('3. failed (job3)');
      console.log(self.status);

      callback(new Error('fuck'));
    }, 1000);
  },

  status: Dispatcher.jobStatus.READY,

  cancel: function() {
    console.log('cancelled (job2)');
  },

  jobName: 'job3',

  jobId: 3
};

var result = []

DispatcherTest = {
  test: function() {
    var self = this;

    task = new DispatcherTask([job, job3], true);

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function() {
      console.log('4. task done (all jobs)')
      console.log(task.status);
    });
  },

  test1: function() {
    var self = this;

    console.log('Test 1: Two ordered tests that both succeed');

    task = new DispatcherTask([job1, job2], true);

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function() {
      console.log('4. task done (all jobs)');
      console.log(task.status);
    });
  },

  test2: function() {
    var self = this;
    console.log('Test 2: Two ordered tests where the second one fails');

    task = new DispatcherTask([job1, job3], true);

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function() {
      console.log('4. task done (all jobs)');
      console.log(task.status);
    });
  },

  test3: function() {
    var self = this;
    console.log('Test 3: Two parallel tests where they both succeed');

    task = new DispatcherTask([job1, job2], false);

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function() {
      console.log('4. task done (all jobs)');
      console.log(task.status);
    });
  },

  test4: function() {
    var self = this;
    console.log('Test 4: Two parallel tests where the first one fails');

    task = new DispatcherTask([job1, job3], false);

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function() {
      console.log('4. task done (all jobs)');
      console.log(task.status);
    });
  },

}
