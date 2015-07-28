Jobs = Object.freeze({
  JobType: {
    DEPOSIT_ITEMS: 'Deposit items',
    DEPOSIT_CASH: 'Deposit cash',
    WITHDRAW_ITEMS: 'Withdraw items',
    WITHDRAW_CASH: 'Withdraw cash'
  },
  JobStatus: {
    COMPLETE: 'Complete',
    PENDING: 'Pending',
    READY: 'Ready'
  }
});

QueueJob = function(jobType, options) {
  // if (jobType === Jobs.JobType.DEPOSIT_ITEMS)


  // check(job,{
  //   jobName: String,
  //   userOne: Object,
  //   userTwo: Match.Optional(Object),
  //   userOneItems: Match.Optional(Object),
  //   userTwoItems: Match.Optional(Object)
  // });

  // this.jobName = job.jobName;
  // this.userOne = job.userOne;
  // this.userTwo = job.userTwo;
  // this.userOneItems = job.userOneItems;
  // this.userTwoItems = job.userTwoItems;
  // this.callback = callback;

  this.status = Jobs.JobStatus.READY;
};

QueueJob.prototype.enQueue = function() {

};

QueueJob.prototype.begin = function() {

};



/*

1. request to add items
  - find bot assigned to user
  - dispatcher adds job to bot queue
  - on job success, bot removes item from queue and starts the next
  - on failure, job is put at the end of the queue and count in incremented
  - need to implement timeout somehow
1. Request to remove items
  - Dispatcher find the items needed and all bots the items are on
  - Dispatcher creates a job or jobs

*/