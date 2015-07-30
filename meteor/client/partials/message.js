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
  }
});
