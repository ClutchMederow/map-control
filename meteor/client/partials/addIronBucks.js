Template.bitcoin.onRendered(function() {
});

Template.addIronBucks.helpers({
  embedCode: function() {
    return Session.get('embed_code');
  }
});

Template.addIronBucks.events({
  'click #add': function(e) {
    Session.set('payment', null);
    Meteor.call('createCheckout', function(err, embed_code) {
      if(err) {
        console.log(err);
      } else {
        console.log(embed_code);
        Session.set('embed_code',embed_code);
      }
    });
  }
});
