Template.ironbucksPicker.onRendered(function() {
  this.$('.ironbucks-input').number(true, 2);
  this.$('.ironbucks-input').focus();
});

Template.ironbucksPicker.events({
  'click .ib-close': function(e, instance) {
    e.stopPropagation();
    e.preventDefault();
    this.currentCash.cash = 0;
    this.currentCash.markAsCancelled();
  },

  'click .ib-done': function(e) {
    e.stopPropagation();
    e.preventDefault();
    var amount = $('.ironbucks-input').val();
    this.currentCash.markAsDone(amount);
  }
});
