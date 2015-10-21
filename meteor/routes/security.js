var OnBeforeActions = {
  loginRequired: function(pause) {
    if (!Meteor.userId()) {
      this.render('landing');
    } else {
      this.next();
    }
  }
};

Router.onBeforeAction(OnBeforeActions.loginRequired, {
  except: [ 'landing', 'about', 'help', 'contact' ]
});
