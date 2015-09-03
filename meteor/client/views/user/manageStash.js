var stashTemplate = new ReactiveVar(null);
var selectedItems = new Mongo.Collection(null);

var stashConfigAlert = {
  timeout: 0,
  html: true,
  onRouteClose: false
};

Template.manageStash.helpers({
  stashTemplate: function() {
    return stashTemplate.get();
  },

  data: function() {
    return {
      selectedItems: selectedItems
    };
  }
});

Template.manageStash.onCreated(function() {
  selectedItems.remove({});
  stashTemplate.set('addRemoveStash');
});

Template.manageStash.events({
  'click #next': function() {
    if (selectedItems.find().count()) {
      stashTemplate.set('confirmStashTransaction');
    } else {
      alert('Please choose at least one item');
    }
  },

  'click #backToAddRemove': function() {
    stashTemplate.set('addRemoveStash');
  },

  'click #submitStashTrans': function() {
    alert('submitting trans');

    var deposits = _.pluck(selectedItems.find({ transType: Enums.TransType.DEPOSIT }, { fields: { itemId: 1, _id: 0 } }).fetch(), 'itemId');
    var withdrawals = _.pluck(selectedItems.find({ transType: Enums.TransType.WITHDRAW }, { fields: { itemId: 1, _id: 0 } }).fetch(), 'itemId');

    Meteor.call('depositItems', deposits, function(err, res) {
      if (err) {
        sAlert.error(err);
      } else {
        console.log(res);
        var message = '<a href="' + Constants.tradeOfferURL + res + '/" target="_blank">Click here to accept your trade request</a>'
        sAlert.success(message, stashConfigAlert);
      }
    });


    stashTemplate.set('stashTransNextSteps');
  },

  'click #nextStepsHome': function() {
    Router.go('home');
  }
});