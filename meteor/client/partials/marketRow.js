Template.marketRow.helpers({
  contWidth: function() {
    if (this.showControls) {
      return 'cell45';
    } else {
      return 'cell55';
    }
  },

  icon: function(isGeneric) {
    return this.iconURL || this.image_url;
  }
});
