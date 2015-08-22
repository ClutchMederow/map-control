Template.channel.helpers({
  active: function() {
    if (Iron.controller().getParams().channel === this.name) {
      return 'active-channel';
    } else {
      return "";
    }
  }
});
