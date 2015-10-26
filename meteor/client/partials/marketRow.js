Template.marketRow.helpers({
  contWidth: function() {
    if (this.showControls) {
      return 'cell45';
    } else {
      return 'cell55';
    }
  }
});