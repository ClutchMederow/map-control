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
    this.status = Dispatcher.jobStatus.FAILED;
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
    this.status = Dispatcher.jobStatus.FAILED;
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
    this.status = Dispatcher.jobStatus.FAILED;
    console.log('cancelled (job3)');
  },

  jobName: 'job3',

  jobId: 3
};

job4 = {
  execute: function(callback) {
    console.log('2. job begin (job4)');

    var self = this;
    this.status = Dispatcher.jobStatus.PENDING;
    console.log(self.status)

    self.timeoutId = Meteor.setTimeout(function() {
      self.status = Dispatcher.jobStatus.COMPLETE;

      console.log('3. complete (job4)');
      console.log(self.status);

      callback();
    }, 3000);
  },

  status: Dispatcher.jobStatus.READY,

  cancel: function() {
    this.status = Dispatcher.jobStatus.FAILED;
    var self = this;
    Meteor.clearTimeout(self.timeoutId);
    console.log('cancelled (job4)');
  },

  jobName: 'job4',

  jobId: 4
};

job5 = {
  execute: function(callback) {
    console.log('2. job begin (job5)');

    var self = this;
    this.status = Dispatcher.jobStatus.PENDING;
    console.log(self.status)

    self.timeoutId = Meteor.setTimeout(function() {
      self.status = Dispatcher.jobStatus.COMPLETE;

      console.log('3. complete (job5)');
      console.log(self.status);

      callback(new Error('uhoh'));
    }, 3000);
  },

  status: Dispatcher.jobStatus.READY,

  cancel: function() {
    this.status = Dispatcher.jobStatus.FAILED;
    var self = this;
    Meteor.clearTimeout(self.timeoutId);
    console.log('cancelled (job5)');
  },

  jobName: 'job5',

  jobId: 5
};

var result = []

DispatcherTest = {
  test: function() {
    var self = this;

    task = new Task([job2, job5], false);

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function(err) {
      console.log('4. task done (all jobs)')
      console.log(task.status);
      console.log(err);
    });

    // job4.execute(function(err) {
    //   console.log(job4.status);
    //   console.log(err);
    // });
  },

  test1: function() {
    var self = this;

    console.log('Test 1: Two ordered tasks that both succeed');

    task = new Task([job1, job3], false);

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function() {
      console.log('4. task done (all jobs)');
      console.log(task.status);
    });
  },

  test2: function() {
    var self = this;
    console.log('Test 2: Two ordered tasks where the second one fails');

    task = new Task([job1, job3], true);

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function() {
      console.log('4. task done (all jobs)');
      console.log(task.status);
    });
  },

  test3: function() {
    var self = this;
    console.log('Test 3: Two parallel tasks where they both succeed');

    task = new Task([job1, job2], false);

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function() {
      console.log('4. task done (all jobs)');
      console.log(task.status);
    });
  },

  test4: function() {
    var self = this;
    console.log('Test 4: Two parallel tasks where the first one fails');

    task = new Task([job1, job3], false);

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function() {
      console.log('4. task done (all jobs)');
      console.log(task.status);
    });
  },

  test5: function() {
    var self = this;
    console.log('Test 5: Two parallel tasks where the first one succeeds and the second is a task of parallel tasks that fails');

    innerTask = new Task([job1, job3], false);
    task = new Task([job4, innerTask], false);

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function() {
      console.log('4. task done (all jobs)');
      console.log(task.status);
    });
  },

  test6: function() {
    var self = this;
    console.log('Test 6: Two parallel tasks where the first one succeeds and the second is a serial task of tasks that fails');

    innerTask = new Task([job1, job3], true);
    task = new Task([job4, innerTask], false);

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function() {
      console.log('4. task done (all jobs)');
      console.log(task.status);
    });
  },

  test7: function() {
    var self = this;
    console.log('Test 7: Two serial tasks where the first one succeeds and the second is serial a task of tasks that fails');

    innerTask = new Task([job1, job3], true);
    task = new Task([job4, innerTask], true);

    innerTask.jobId = 'innerTask';
    task.jobId = 'task';

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function() {
      console.log('4. task done (all jobs)');
      console.log(task.status);
    });
  },

  test8: function() {
    var self = this;
    console.log('Test 8: Two serial tasks where the first one succeeds and the second is parallel a task of tasks that fails');

    innerTask = new Task([job1, job3], false);
    task = new Task([job4, innerTask], true);

    console.log('1. executing task (all jobs)');
    console.log(task.status);

    task.execute(function() {
      console.log('4. task done (all jobs)');
      console.log(task.status);
    });
  },
};

