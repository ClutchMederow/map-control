/* global window */
/* global sAlert */
/* global StashManager */
/* global Enums */

Template.manageStash.helpers({
  stashTemplate: function() {
    return Template.instance().stashTemplate.get();
  },

  data: function() {
    return {
      stashManager: Template.instance().stashManager,
    };
  },
});

Template.manageStash.onCreated(function() {
  this.stashTemplate = new ReactiveVar('addRemoveStash');
  this.stashManager = new StashManager();
});

Template.manageStash.events({
  'click #next': function(e, template) {
    if (template.stashManager.hasItems()) {
      template.stashTemplate.set('confirmStashTransaction');
      window.scrollTo(0,0);
    } else {
      sAlert.warning('Please select at least one item');
    }

    return true;
  },

  'click #backToAddRemove': function(e, template) {
    template.stashTemplate.set('addRemoveStash');
    window.scrollTo(0,0);
  },

  'click #submitStashTrans': function(e, template) {
    if (template.stashManager.hasItems()) {
      template.stashManager.execute();
      template.stashTemplate.set('stashTransNextSteps');
      window.scrollTo(0,0);
    } else {
      sAlert.warning('Please select at least one item');
    }
  },

  'click #nextStepsHome': function(event, template) {
    event.preventDefault();
    template.stashTemplate.set('addRemoveStash');
  },

  'click #withdraw-div .contained-item': function(e, template) {
    e.preventDefault();
    template.stashManager.toggleItem(this, Enums.TransType.WITHDRAW);
  },

  'click #deposit-div .contained-item': function(e, template) {
    e.preventDefault();
    template.stashManager.toggleItem(this, Enums.TransType.DEPOSIT);
  },
});