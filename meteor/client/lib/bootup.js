/* global ModalHelper */
/* global Notifications */
/* global sAlert */

Meteor.startup(function () {
    sAlert.config({
        effect: '',
        position: 'top-left',
        timeout: 2000,
        html: true,
        onRouteClose: false,
        stack: true,
        offset: 0,
    });

  /*
   * use data.alertType to pick your template
   * put use message to fill in that template
  */
  var query = Notifications.find();
  var handle = query.observeChanges({
    added: function(id, { message, data, viewed }) {
      const alertType = data ? data.alertType : null;
      if(viewed === false) {
        if (alertType === 'realtimeAccepted' 
            || alertType === 'realtimeCreated'
            || alertType === Constants.inventoryManagementTemplate
           ) {
          sAlert.success({ message, data, timeout: 0 });
        } else { //Simple notifications
          sAlert.info({ message, data });
        }
        Notifications.update({_id: id}, {$set: {viewed: true}});
      }
    },
  });

  ModalHelper.closeAllModals();

  //TODO: put in global config for live notifications, then call stop if it's
  //changed
});
