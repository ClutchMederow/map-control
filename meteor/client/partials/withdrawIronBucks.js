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
    var amount = parseFloat($('#withdrawAmount').val());
    if(checkAmount(amount)) {
      withdrawPending.set('pending');
      Meteor.call('sendMoney', amount, function(err, withdrawalAmount) {
        if(err) {
          console.log(err);
          withdrawPending.set(null);
          $('#withdrawAmount').val(null);
        } else {
          //TODO: round this to two decimal places
          sAlert.success('Successfully withdrew: $' + roundCurrency(withdrawalAmount) + " USD");
          withdrawPending.set(null);
          $('#withdrawAmount').val(null);
        }
      });

    }
  },
  /*
  'change #currency': _.debounce(function(e) {
    reactiveCurrency.set(e.target.value);
  }, 200),
 */
  'change #withdrawAmount': _.debounce(function(e) {
    reactiveAmount.set(e.target.value);
  },200)
});

function checkAmount(amount) {
  //check(amount, Number);
  if(_.isNaN(amount)) {
    sAlert.error('Please enter an amount')
    return false;
  } else if(amount > Config.financial.maxWithdrawAmount) {
    sAlert.error('Please enter an amount less than $' +
                  Config.financial.maxWithdrawAmount);
    return false;
  } else if (amount > Meteor.user().profile.ironBucks) {
    sAlert.error("You can't take more than you have...");
    return false;
  } else {
    return true;
  }
}
