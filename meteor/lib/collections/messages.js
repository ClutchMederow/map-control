Messages = new Mongo.Collection('messages');

Messages.attachSchema({
  user: {
    type: Object,
    label: "User Profile and Id",
    blackbox: true
  },
  /*
  "user.$.userId": {
    type: String,
    label: "User Id"
  },
  "user.$.profile": {
    type: Object,
    label: "User profile",
    blackbox: true
  },
   */
  datePosted: {
    type: Date,
    label: 'date message posted'
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
