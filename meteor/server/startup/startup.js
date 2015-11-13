Meteor.startup(function() {
  SyncedCron.start();
  Dispatcher.init();
  Meteor.setInterval(Dispatcher.checkOutstandingTradeoffers, 30000);
});
