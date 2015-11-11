var reactiveAmount = new ReactiveVar(null);
/*
   var reactiveCurrency = new ReactiveVar(null);
   var reactiveIronBucks = new ReactiveVar(null);
   */

var withdrawPending = new ReactiveVar(null);

Template.withdrawIronBucks.onCreated(function(){ 
  this.subscribe('coinbaseCurrencies');
});

Template.withdrawIronBucks.onRendered(function() {
  this.autorun(function() {
    if(CoinbaseCurrencies.findOne()) {
      $('select').material_select();
    }
  });
});

Template.withdrawIronBucks.helpers({
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
totalCost: function() {
if(reactiveAmount.get() && reactiveCurrency.get()) {
  //TODO: handle bitcoin?
  var amount = reactiveAmount.get() / currValue(reactiveCurrency.get());
  var total = amount + (amount * Config.financial.fee) ;
  return formatCurr(total, "USD");
  }
  },
currencies: function() {
return CoinbaseCurrencies.find(); 
},
*/
  price: function() {
    if(reactiveAmount.get()) {
      var total = parseFloat(reactiveAmount.get());
      return formatCurr(total, "USD");
    }
  },

  withdrawPending: function() {
    return withdrawPending.get();
  },
});

Template.withdrawIronBucks.events({
  'click #withdraw': function(e) {
    Session.set('payment', null);
    var amount = $('#amount').val();
    if(!_.isEmpty(amount)) {
      withdrawPending.set('pending');
      Meteor.call('sendMoney', amount, function(err, withdrawalAmount) {
        if(err) {
          console.log(err);
          withdrawPending.set(null);
        } else {
          //TODO: round this to two decimal places
          sAlert.success('Successfully withdrew: $' + roundCurrency(withdrawalAmount) + " USD");
          withdrawPending.set(null);
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
  },200)
});
