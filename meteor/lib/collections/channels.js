Channels = new Meteor.Collection('channels');

Channels.attachSchema({
  name: {
    type: String,
    label: 'Name of Channel'
  },

  publishedToUsers: {
    type: [String],
    label: 'String of users that belong to this channel or public',
    optional: true
  },

  category: {
    type: String,
    label: 'Category of channel',
    optional: true
  },

  users: {
    type: [Object],
    label: 'Users',
    blackbox: true,
    optional: true
  },

  show: {
    type: [String],
    label: 'Show',
    optional: true
  }
});

Channels.allow({
  update: function(userId, doc, fieldNames, modifier) {
    if (doc.category !== 'Private') return false;

    if (JSON.stringify(modifier) === JSON.stringify({ $push: { show: userId } })) {
      if (doc.show.indexOf(modifier.$push.show) === -1) {
        return true;
      }
    } else if (JSON.stringify(modifier) === JSON.stringify({ $pull: { show: userId } })) {
      return true;
    }
    return false;
  }
});