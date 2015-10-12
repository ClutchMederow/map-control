Meteor.users.after.insert(function (userId, doc) {
  Meteor.users.update(doc._id, {$set: {ironBucks: 0}});
});
