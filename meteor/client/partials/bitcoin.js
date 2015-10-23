Template.bitcoin.onRendered(function() {
  Session.set('payment', null);
  Meteor.call('createCheckout', function(err, embed_code) {
    if(err) {
      console.log(err);
    } else {
      console.log(embed_code);
      Session.set('payment',"https://www.coinbase.com/checkouts/" + embed_code);
    }
  });
});

Template.bitcoin.helpers({
  payment: function() {
    return Session.get('payment');
  }
});

Template.bitcoin.events({
  'click #sendMoney': function(e) {
    var args = {
      recipient: "bojanglesh@hotmail.com", 
      amount: "0.001", 
      currency: "BTC", 
      description: "sending payment back"
    };
    Meteor.call('sendMoney', "bojanglesh@hotmail.com", "0.0001", "BTC", "sending payment back", 
                function(err, res) {
      if(err) {
        console.log(err);
      } else {
        console.log(res);
      }
    });
  }
});
