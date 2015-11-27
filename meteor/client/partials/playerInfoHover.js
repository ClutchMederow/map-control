Template.playerInfoHover.onRendered( function() {
  $('.user-dropdown').dropdown({
    inDuration: 300,
    outDuration: 225,
    constrain_width: false, // Does not change width of dropdown to that of the activator
    hover: true, // Activate on hover
    gutter: 50, // Spacing from edge
    belowOrigin: false // Displays dropdown below the button
  });
});

Template.playerInfoHover.helpers({
  getImageMed: function() {
    if (this.user && this.user.avatar) {
      return this.user.avatar.medium;
    }
  },

  notMe: function() {
    return Meteor.userId() !== this.user.userId;
  },

  //TODO: refactor below 2 functions into one function with css
  state: function() {
    var presence = Presences.findOne({userId: this.user.userId});
    return (presence && presence.state) ? 'online' : '';
  },

  status: function() {
    var presence = Presences.findOne({userId: this.user.userId});
    return presence ? presence.state : "offline";
  },
});

Template.playerInfoHover.events({
  'click .privateChat': function(e) {
    e.preventDefault();

    // to close menu
    $('#' + this._id).trigger('mouseleave');

    Meteor.call('startPrivateChat',this.user.userId, function(error) {
      if(error) {
        sAlert.error(error.reason);
      }
    });
  },

  'click .beginTrade': function(e) {
    e.preventDefault();

    // to close menu
    $('#' + this._id).trigger('mouseleave');

    Meteor.call('createRealTimeTrade', this.user.userId, function(error, result) {
      if(error) {
        sAlert.error(error.reason);
      } else {

        // if trade already exists, opens it
        if (result) {
          Session.set('realTime', result);
        } else {
          sAlert.success('Invite sent. You will be notified if they accept it.');
        }
      }
    });
  //{{pathFor route='realTimeTrading' data=getUsers}}
  }
});
