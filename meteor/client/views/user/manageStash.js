var stashTemplate = new ReactiveVar(null);
var selectedItems = new Mongo.Collection(null);

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
    stashTemplate.set('stashTransNextSteps');

    // TODO: Add further instructions template
  },

  'click #nextStepsHome': function() {
    Router.go('home');
  }
});