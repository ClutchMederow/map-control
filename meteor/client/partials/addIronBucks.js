var reactiveAmount = new ReactiveVar(null);
/*
var reactiveCurrency = new ReactiveVar(null);
var reactiveIronBucks = new ReactiveVar(null);
*/

var addPending = new ReactiveVar(null);

Template.addIronBucks.onCreated(function(){
  this.subscribe('coinbaseCurrencies');
});

Template.addIronBucks.onRendered(function() {
  this.autorun(function() {
    if(CoinbaseCurrencies.findOne()) {
      $('select').material_select();
    }
  });
  Session.set('embed_code', null);
});

Template.addIronBucks.helpers({
  embedCode: function() {
    return Session.get('embed_code');
  },
  /*
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
 */
  price: function() {
    if(reactiveAmount.get()) {
      var total = parseFloat(reactiveAmount.get());
      return formatCurr(total, "USD");
    }
  },
  hasEmail: function() {
    if(Meteor.user() && Meteor.user().profile.email) {
      return true;
    } else {
      return false;
    }
  },
  addPending: function() {
    return addPending.get();
  }
});

Template.addIronBucks.events({
  'click #cancel': function(e) {
    Session.set('embed_code', null);
  },

  'click #add': function(e) {
    Session.set('payment', null);
    var amount = parseFloat($('#amount').val());
    if(checkAmount(amount)) {
      addPending.set('pending');
      Meteor.call('createCheckout', amount, function(err, embed_code) {
        if(err) {
          sAlert.error(err);
          addPending.set(null);
          $('#amount').val(null);
        } else {
          Session.set('embed_code',embed_code);
          $('#amount').val(null);
          addPending.set(null);
        }
      });
    }
  },
  /*
  'change #currency': _.debounce(function(e) {
    reactiveCurrency.set(e.target.value);
  }, 200),
  */
  'change #amount': _.debounce(function(e) {
    reactiveAmount.set(e.target.value);
  },200),
});

//check the entered amount 
function checkAmount(amount) {
  //check(amount, Number);
  if(_.isNaN(amount)) {
    sAlert.error('Please enter an amount')
    return false;
  } else if(amount > Config.financial.maxAddAmount) {
    sAlert.error('Please enter an amount less than $' +
                  Config.financial.maxAddAmount);
    return false;
  } else {
    return true;
  }
}
