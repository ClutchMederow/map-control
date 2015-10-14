var stashTemplate = new ReactiveVar(null);

Template.manageStash.helpers({
  stashTemplate: function() {
    return stashTemplate.get();
  },

  data: function() {
    return {
      stashManager: Template.instance().stashManager
    };
  }
});

Template.manageStash.onCreated(function() {
  stashTemplate.set('addRemoveStash');
  this.stashManager = new StashManager();
});

Template.manageStash.events({
  'click #next': function(e, thisInstance) {
    if (thisInstance.stashManager.hasItems()) {
      stashTemplate.set('confirmStashTransaction');
    } else {
      sAlert.warning('Please select at least one item');
    }

    return true;
  },

  'click #backToAddRemove': function() {
    stashTemplate.set('addRemoveStash');
  },

  'click #submitStashTrans': function(e, thisInstance) {

    if (thisInstance.stashManager.hasItems()) {
      thisInstance.stashManager.execute();
      stashTemplate.set('stashTransNextSteps');
    } else {
      sAlert.warning('Please select at least one item');
    }
  },

  'click #nextStepsHome': function() {
    Router.go('home');
  },

  'click #withdraw-div .contained-item': function(e, thisInstance) {
    e.preventDefault();

    thisInstance.stashManager.toggleItem(this, Enums.TransType.WITHDRAW);
  },

  'click #deposit-div .contained-item': function(e, thisInstance) {
    e.preventDefault();

    thisInstance.stashManager.toggleItem(this, Enums.TransType.DEPOSIT);
  }

  // 'click .trade-alert a': function(e) {

  // }
});