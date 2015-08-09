Meteor.methods({
  finishedWelcomeTour: function() {
    Meteor.users.update(this.userId, {$set: {firstLoggedIn: false}});
  }
});
