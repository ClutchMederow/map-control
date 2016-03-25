var OnBeforeActions = {
  loginRequired: function(req, res, next) {
    if (!Meteor.userId()) {
      this.redirect('landing');
    } else {
      this.next();
    }
  }
};

Router.onBeforeAction(OnBeforeActions.loginRequired, {
  only: [
    'content',
    'videos',
    'bitcoin',
    'ironbucks',
    'ironbucks/add',
    'ironbucks/withdraw',
    'chats',
    'steam',
    'home',
    'tour',
    'notifications',
    'inventory',
    'transactions/:userId',
    'managestash',
    'profile',
    'offer'
  ],
});
