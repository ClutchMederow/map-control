
Template.manageStash.helpers({
  stashTemplate: function() {
    return Template.instance().stashTemplate.get();
  },

  data: function() {
    return {
      stashManager: Template.instance().stashManager
    };
  }
});

Template.manageStash.onCreated(function() {
  this.stashTemplate = new ReactiveVar('addRemoveStash');
  this.stashManager = new StashManager();
});

Template.manageStash.events({
  'click #next': function(e, thisInstance) {
    if (thisInstance.stashManager.hasItems()) {
      thisInstance.stashTemplate.set('confirmStashTransaction');
      window.scrollTo(0,0);
    } else {
      sAlert.warning('Please select at least one item');
    }

    return true;
  },

  'click #backToAddRemove': function(e, thisInstance) {
    thisInstance.stashTemplate.set('addRemoveStash');
    window.scrollTo(0,0);
  },

  'click #submitStashTrans': function(e, thisInstance) {

    if (thisInstance.stashManager.hasItems()) {
      thisInstance.stashManager.execute();
      thisInstance.stashTemplate.set('stashTransNextSteps');
      window.scrollTo(0,0);
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