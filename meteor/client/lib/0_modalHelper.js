ModalHelper = {
  openModal: function(modalName, data) {
    this.closeAllModals();
    Session.set(modalName, data);
  },

  closeAllModals: function() {
    Session.set('offer', null);
    Session.set('realTime', null);
    Session.set('listing', false);
  },
};
