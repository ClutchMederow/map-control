Template.accessToken.helpers({
  tradeURL: function() {
    return Constants.tradeURL;
  },

  currentTradeURL: function() {
    var user = Meteor.user();

    if (user && user.profile) {
      return user.profile.tradeURL || '';
    } else {
      return '';
    }
  },

  currentEmail: function() {
    var user = Meteor.user();

    if (user && user.profile) {
      return user.profile.email || '';
    } else {
      return '';
    }
  },

  goodToGo: function() {
    if (Meteor.user() && Meteor.user().profile) {
      return !!Meteor.user().profile.email && !!Meteor.user().profile.tradeURL;
    } else {
      return false;
    }
  }
});

Template.accessToken.events({
  'submit #tradeurl-form': function(e) {
    e.preventDefault();
    $('.error-msg').hide();

    try {
      var url = $('#tradeurl-input').val();
      var email = $('#emailAddress').val();

      // Do a cursory check - see if the token is present
      // we will do a more thorough check server side
      var hasToken = /&token=/.test(url);

      //TODO: ensure valid email
      if (hasToken && _.isString(email)) {
        Meteor.call('addTradeURL', url, email, function(error, result) {
          if (error) {
            sAlert.error('Failed to update trade URL - please try again later.');
          } else {
            sAlert.success('Updated details successfully');
          }
        });
      } else {
        $('.error-msg').show();
      }
    } catch(err) {
      $('.error-msg').show();
    }
  }
});
