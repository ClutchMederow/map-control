Template.realTimeModal.helpers({
  realTime: function() {
    var trade = Session.get('realTime');
    if (trade) {
      return RealTimeTrade.findOne(trade._id);
    }
  },
});
