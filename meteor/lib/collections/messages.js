Messages = new Mongo.Collection('messages');

Messages.attachSchema({
  userId: {
    type: String,
    label: "user Id"
  },
  text: {
    type: String,
    label: "Text of Message"
  },
  channel: {
    type: String,
    label: 'Channel of Message'
  }
});
