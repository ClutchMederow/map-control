var reactiveAmount = new ReactiveVar(null);
var reactiveCurrency = new ReactiveVar(null);
var reactiveIronBucks = new ReactiveVar(null);

Template.addIronBucks.onCreated(function(){ 
  this.subscribe('coinbaseCurrencies');
});

Template.addIronBucks.onRendered(function() {
  this.autorun(function() {
    if(CoinbaseCurrencies.findOne()) {
      $('select').material_select();
    }
  });

  Meteor.call('getIronBucks', function(error, ironBucks) {
    if(error) {
      console.log(error);
    } else {
      reactiveIronBucks.set(ironBucks);
    }
  });
});

Template.addIronBucks.helpers({
  embedCode: function() {
    return Session.get('embed_code');
  },
  conversionRate: function() {
    if(reactiveAmount.get() && reactiveCurrency.get()) {
      //TODO: handle bitcoin?
      var total = reactiveAmount.get() / currValue(reactiveCurrency.get());
      return formatCurr(total, "USD");
    }
  },
  currencies: function() {
    return CoinbaseCurrencies.find(); 
  }
});

Template.addIronBucks.events({
  'click #add': function(e) {
    Session.set('payment', null);
    var amount = $('#amount').val();
    var currency = $("#currency").val();
    Meteor.call('createCheckout', amount, currency, function(err, embed_code) {
      if(err) {
        console.log(err);
      } else {
        Session.set('embed_code',embed_code);
      }
    });
  },
  'change #currency': _.debounce(function(e) {
    reactiveCurrency.set(e.target.value);
  }, 200),
  'change #amount': _.debounce(function(e) {
    reactiveAmount.set(e.target.value);
  },200)
});
