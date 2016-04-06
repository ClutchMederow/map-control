Meteor.startup(function () {
    sAlert.config({
        effect: '',
        position: 'top-left',
        timeout: 0,
        html: true,
        onRouteClose: false,
        stack: true,
        offset: 0,
    });

  var query = Notifications.find();
  var handle = query.observeChanges({
    added: function(id, { message, data, viewed }) {
      if(viewed === false) {
        sAlert.success({ message, data });
        Notifications.update({_id: id}, {$set: {viewed: true}});
      }
    }
  });

  ModalHelper.closeAllModals();

  //TODO: put in global config for live notifications, then call stop if it's
  //changed
});
