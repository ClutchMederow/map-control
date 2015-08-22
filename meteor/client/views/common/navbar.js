var userNavOptions = {
  loggedOut: [
    {
      text: 'log in',
      thisClass: 'navLogin'
    },
    {
      text: 'sign up',
      thisClass: 'navLogin'
    }
  ],
  loggedIn: [
    {
      text: 'profile',
      thisClass: 'navProfile'
    },
    {
      text: 'sign out',
      thisClass: 'navLogout'
    }
  ],
  loggingIn: []
};

Template.navbar.rendered = function() {
  this.$(".dropdown-button").dropdown({ belowOrigin: true, hover: true });
};

Template.navbar.helpers({
  userNavOptions: function() {
    if (Meteor.user()) {
      if (Meteor.loggingIn()) {
        return [];
      } else {
        return userNavOptions.loggedIn;
      }
    } else {
      return userNavOptions.loggedOut;
    }
  },

  userNavText: function() {
    var user = Meteor.user();
    if (user && user.profile) {
      return user.profile.name;
    } else {
      return 'sign in';
    }
  },

  loggedIn: function() {
    return !!Meteor.user();
  }
});

Template.navbar.events({
  'click .navLogin': function() {
    Meteor.loginWithSteam(function(error, data) {
      if(error) {
        console.log(error.reason);
      } else {
        Router.go('home');
      }
    });
  },

  'click .navLogout': function() {
    Meteor.logout(function(error, data) {
      if(error) {
        console.log(error.reason);
      } else {
        Router.go('/');
      }
    });
  }
})