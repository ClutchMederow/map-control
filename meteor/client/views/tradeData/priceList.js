Template.pricelist.helpers({
  options: function() {
    return {limit: 25};
  }
});

Template.pricelist.events({
  'click #change': function(e) {
    console.log('click');
    EasySearch.changeProperty('priceListIndex', 'orderBy', 'volume')
  }
});

