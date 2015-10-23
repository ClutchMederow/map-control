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
