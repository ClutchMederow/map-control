Meteor.startup(function() {
  if (Meteor.settings.environment === 'prod') {
    SyncedCron.start();
    Dispatcher.init();
    Dispatcher.startPolling();
  }
});
