Meteor.users.after.insert(function (userId, doc) {
  Meteor.users.update(userId, {$set: {ironBucks: 0}});
});
