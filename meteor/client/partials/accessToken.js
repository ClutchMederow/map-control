Template.accessToken.helpers({
  tradeURL: function() {
    return Constants.tradeURL;
  },

  currentTradeURL: function() {
    var user = Meteor.user();

    if (user && user.profile) {
      return user.profile.tradeURL || '';
    } else {
      return ''
    }
  }
});

Template.accessToken.events({
  'submit #tradeurl-form': function(e) {
    e.preventDefault();
    $('.error-msg').hide();

    try {
      var url = $('#tradeurl-input').val();

      // Do a cursory check - see if the token is present
      // we will do a more thorough check server side
      var hasToken = /&token=/.test(url);

      if (hasToken) {
        Meteor.call('addTradeURL', url, function(error, result) {
          if (error) {
            sAlert.error('Failed to update trade URL - please try again later.');
          } else {
            sAlert.success('Updated trade URL successfully');
          }
        });
      } else {
        $('.error-msg').show();
      }
    } catch(err) {
      $('.error-msg').show();
    }
  }
})