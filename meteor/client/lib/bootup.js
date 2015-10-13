Meteor.startup(function () {
    sAlert.config({
        effect: '',
        position: 'top-left',
        timeout: 5000,
        html: false,
        onRouteClose: true,
        stack: true,
        offset: 0
    });

  var query = Notifications.find();
  var handle = query.observeChanges({
    added: function(id, fields) {
      if(fields.viewed === false) {
        sAlert.success(fields.message);
        Notifications.update({_id: id}, {$set: {viewed: true}});
      }
    } 
  });

  //TODO: put in global config for live notifications, then call stop if it's
  //changed
});
