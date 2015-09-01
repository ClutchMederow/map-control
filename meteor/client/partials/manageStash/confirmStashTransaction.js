Template.confirmStashTransaction.helpers({
  withdrawOptions: function() {
    return {
      title: 'Items to be withdrawn',
      items: this.selectedItems.find({ transType: Enums.TransType.WITHDRAW }).fetch(),
      columns: '6',
      class: 'confirm-manage-items',
      noSearch: true
    };
  },

  depositOptions: function() {
    console.log(this.selectedItems.find());
    return {
      title: 'Items to be deposited',
      items: this.selectedItems.find({ transType: Enums.TransType.DEPOSIT }).fetch(),
      columns: '6',
      class: 'confirm-manage-items',
      noSearch: true
    };
  },

  withdrawExists: function() {
    return !!this.selectedItems.find({ transType: Enums.TransType.WITHDRAW }).count();
  },

  depositExists: function() {
    return !!this.selectedItems.find({ transType: Enums.TransType.DEPOSIT }).count();
  }
});