Template.notifications.helpers({
  realTimeRequests: function() {
    return RealTimeTrade.find({user2Stage: "INVITED"});
  },
});

Template.notifications.events({
  'click .accept': function() {
    Meteor.call('acceptRealTimeTrade', this._id, function(error, realTimeTradeId) {
      if(error) {
        console.log(error.reason);
        sAlert.error('Could not accept real time trade');
      } else {
        console.log(realTimeTradeId);
        sAlert.success("Would you like to go to trading room?" +
        "<a href='/realtime/" + realTimeTradeId + "' id='realTimeTradeId'>click here</a>", {html: true, timeout:10000});
      }
    });
  },
  'click .reject': function() {
    Meteor.call('rejectRealTimeTrade', this._id, function(error) {
      if(error) {
        console.log(error.reason);
        sAlert.error('Could not reject trade');
      } else {
        sAlert.success("Trade offer rejected");
      }
    });
  }
});
