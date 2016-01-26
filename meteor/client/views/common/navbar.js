var userNavOptions = {
  loggedOut: [
    {
      text: 'log in',
      thisClass: 'navLogin',
      href: '#!'
    },
    {
      text: 'sign up',
      thisClass: 'navLogin',
      href: '#!'
    }
  ],
  loggedIn: [
    {
      text: 'profile',
      thisClass: 'navProfile',
      href: '/profile'
    },
    {
      text: 'sign out',
      thisClass: 'navLogout',
      href: '#!'
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
  },

  currentRouteClass: function(name) {
    var curr = Router.current();
    if (curr && curr.route) {
      return curr.route.getName() === name ? 'active-route' : '';
    }

    return '';
  },
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
});
