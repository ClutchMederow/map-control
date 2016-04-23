Meteor.startup(function() {
  _ = lodash;
  if (Meteor.settings.environment === 'prod') {
    SyncedCron.start();
  }
});
