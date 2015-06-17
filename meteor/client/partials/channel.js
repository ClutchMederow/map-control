Template.channel.helpers({
  active: function() {
    if (Session.get('channel') === this.name) {
      return 'teal lighten-3';
    } else {
      return "";
    }
  }
});
