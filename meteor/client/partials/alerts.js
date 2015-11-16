Template.alerts.helpers({
  //can be offers, requests, or invites
  myAlerts: function() {
    //TODO: have logical delete
    return RealTimeTrade.find({completed: { $ne: true }},
                              {sort: {modifiedTimestamp: -1}});
  },
  isAccepted: function() {
    //TODO: change to enum
    return this.user1Stage === "TRADING";
  },
  //note: this relies on user1 always being requestor
  //and user2 always being invitee
  isOffer: function() {
    if(this.listingId) {
      return true;
    } else {
      return false;
    }
  },
  //user1 is requestor
  isRequest: function() {
    if(!_.isString(this.listingId) && this.user1Id === Meteor.userId()) {
      return true;
    } else {
      return false;
    }
  },
  //user2 is invitee
  isInvite: function() {
    if(!_.isString(this.listingId) && this.user2Id === Meteor.userId()) {
      return true;
    } else {
      return false;
    }

  },
});

Template.alerts.events({
  'click .accept': function() {
    var self = this;
    Meteor.call('acceptRealTimeTrade', this._id, function(error, realTimeTradeId) {
      if(error) {
        sAlert.error('Could not accept real time trade');
      } else {
        Session.set('realTime', RealTimeTrade.findOne({"_id": self._id}));
      }
    });
  },
  'click .reject': function() {
    Meteor.call('rejectRealTimeTrade', this._id, function(error) {
      if(error) {
        sAlert.error('Could not reject trade');
      }
    });
  },
  'click .open': function() {
    Session.set('realTime', RealTimeTrade.findOne({"_id": this._id}));
  }
});
