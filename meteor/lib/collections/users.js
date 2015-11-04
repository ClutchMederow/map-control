Meteor.users.after.insert(function (userId, doc) {

  Meteor.users.update(doc._id, {$set: {
    "profile.ironBucks": 0,
    "profile.firstTimeUser": true
  }});

});

//This is probably unnecessary, see quote from Meteor docs below:
//"If you never set up any allow rules on a collection then all client writes to
//the collection will be denied, and it will only be possible to write to the
//collection from server-side code."
Meteor.users.deny({  
  insert: function (userId, doc) {
    return true;
  },
  update: function (userId, doc, fields, modifier) {
    return true;
  },
  remove: function (userId, doc) {
    return true;
  },
});
