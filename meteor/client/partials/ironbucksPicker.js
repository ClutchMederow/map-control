Template.ironbucksPicker.onRendered(function() {
  this.$('.ironbucks-input').number(true, 2);
  this.$('.ironbucks-input').select();
});

Template.ironbucksPicker.events({
  'click .ib-close': function(e, instance) {
    this.currentCash.cash = 0;
    this.currentCash.markAsCancelled();
  },

  'click .ib-done': function(e) {
    e.preventDefault();
    var amount = $('.ironbucks-input').val();
    this.currentCash.markAsDone(amount);
  }
});
