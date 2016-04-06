/* global Notifications */

Notifications = new Mongo.Collection('notifications');

Notifications.attachSchema({
  userId: {
    type: String,
    label: "User Id",
  },
  message: {
    type: String,
    label: "Message",
  },
  viewed: {
    type: Boolean,
    label: 'Viewed',
  },
});

Notifications.allow({
  update: function(userId, doc) {
    return doc.userId === userId;
  },
});

//Users can't add or remove notifications, and can't
//change userId of document
Notifications.deny({
  insert: function() {
    return true;
  },
  update: function(userId, doc, fields) {
    return _.contains(fields, 'userId');
  },
  remove: function() {
    return true;
  },
});
