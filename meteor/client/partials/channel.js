Template.channel.helpers({
  active: function() {
    if (Session.get('channel') === this.name) {
      return 'active-channel';
    } else {
      return "";
    }
  }
});
