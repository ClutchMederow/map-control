/* global RealTimeTrade */
/* global ModalHelper */
/* global sAlert */

const templateMap = {
  'realtimeCreated': 'alertButtonsRealtime',
  'realtimeAccepted': 'alertButtonsRealtimeAccepted',
};

Template.sAlertCustom.helpers({
  alertType: function() {
    return this.data ? templateMap[this.data.alertType] : null;
  },
});

Template.sAlertCustom.events({
  'click .accept-realtime': function(event) {
    event.preventDefault();

    const realtimeId = this.data.realtimeId;
    sAlert.close(this._id);

    Meteor.call('acceptRealTimeTrade', realtimeId, function(error) {
      if(error) {
        sAlert.error('Could not accept real time trade');
      } else {
        const trade = RealTimeTrade.findOne({ _id: realtimeId });
        ModalHelper.openModal('realTime', trade);
      }
    });
  },

  'click .ignore-realtime': function(event) {
    event.preventDefault();

    const realtimeId = this.data.realtimeId;
    const modalId = this._id;

    sAlert.close(modalId);

    Meteor.call('rejectRealTimeTrade', realtimeId, function(error) {
      if(error) {
        sAlert.error('Could not reject trade');
      }
    });
  },

  'click .open-realtime': function(event) {
    event.preventDefault();
    sAlert.close(this._id);
    const realtimeId = this.data.realtimeId;
    const trade = RealTimeTrade.findOne({ _id: realtimeId });
    ModalHelper.openModal('realTime', trade);
  },
});
