Template.message.onRendered( function() {
  $('.dropdown-button').dropdown({
    inDuration: 300,
    outDuration: 225,
    constrain_width: false, // Does not change width of dropdown to that of the activator
    hover: true, // Activate on hover
    gutter: 0, // Spacing from edge
    belowOrigin: true // Displays dropdown below the button
  });
});

Template.message.helpers({
  getUsers: function() {
    return {
      userId1: Meteor.userId(),
      userId2: this.user.userId
    };
  }
});
Template.message.events({
  'click .privateChat': function(e) {
    e.preventDefault();
    console.log(this);
    Meteor.call('startPrivateChat',this.user.userId,function(error) {
      if(error) {
        console.log(error.reason);
      }
    });
  },
  'click .beginTrade': function(e) {
    e.preventDefault();
    console.log(this);
    Meteor.call('createRealTimeTrade', this.user.userId,function(error) {
      if(error) {
        sAlert.error('Could not invite user to real time trade');
      } else {
        sAlert.success('Successfully sent invite. You will be notified if they accept it');
      }
    });
  //{{pathFor route='realTimeTrading' data=getUsers}}  
  }
});
