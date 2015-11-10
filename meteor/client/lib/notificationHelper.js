Notifications.find({viewed: false}).observeChanges({
  added: function(id, notification){
    sAlert.success(notification.text);
    Notifications.update(id, {$set: {viewed:true}});
  }
});
