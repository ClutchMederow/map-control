Template.myTransactions.helpers({
  transactions: function() {
    var context = this;
    if(context === 'All') {
      //TODO: make this an enum
      return Transactions.find({stage: "INITIAL_OFFER"});
    } else {
      return Transactions.find({stage: "INITIAL_OFFER", user2Id: context.userId});
    }
  }
});

Template.myTransactions.events({
  'click .cancelOffer': function(e) {
    Meteor.call('cancelTrade', this._id, function(error) {
      if(error) {
        console.log(error.reason);
      } else {
        console.log('Successfully canceled trade');
      }
    });
  }
});
