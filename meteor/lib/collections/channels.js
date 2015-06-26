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
  }
});
