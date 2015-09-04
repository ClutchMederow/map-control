var stashTemplate = new ReactiveVar(null);
var stashManager = new StashManager();

Template.manageStash.helpers({
  stashTemplate: function() {
    return stashTemplate.get();
  },

  data: function() {
    return {
      selectedItems: stashManager.selectedItems
    };
  }
});

Template.manageStash.onCreated(function() {
  stashTemplate.set('addRemoveStash');
});

Template.manageStash.events({
  'click #next': function() {
    if (stashManager.hasItems()) {
      stashTemplate.set('confirmStashTransaction');
    } else {
      sAlert.warning('Please select at least one item');
    }
  },

  'click #backToAddRemove': function() {
    stashTemplate.set('addRemoveStash');
  },

  'click #submitStashTrans': function() {
    if (stashManager.hasItems()) {
      stashManager.execute();
      stashTemplate.set('stashTransNextSteps');
    } else {
      sAlert.warning('Please select at least one item');
    }
  },

  'click #nextStepsHome': function() {
    Router.go('home');
  }
});