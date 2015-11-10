Listings = new Mongo.Collection('listings');

Listings.attachSchema({
  user: {
    type: Object,
    label: 'denormalized user for easy reference',
    blackbox: true
  },
  items: {
    type: [Object],
    label: '1 or more items for trade OR cash',
    blackbox: true,
    optional: true
  },
  request: {
    type: [Object],
    label: 'Desired items or cash',
    blackbox: true,
    optional: true
  },
  datePosted: {
    type: Date,
    label: 'Date trade request posted'
  },
  notes: {
    type: String,
    label: 'Notes on request',
    optional: true
  },
  closeDate: {
    type: Date,
    label: 'Date trade request closed',
    optional: true
  },
  closeReason: {
    type: String,
    label: 'Reason TradeRequest closed',
    optional: true
  }
});

//TODO: make this work for either items or requests
//and put a radio button on the market
Listings.searchItems = function(selector, searchText, fields) {
  var listings = Listings.find(selector).fetch();
  var matchingDocuments = [];
  var terms = searchText.replace(/\W/g,' ').trim().split(" ");
  var regExp = new RegExp("(?=.*" + terms.join(")(?=.*") + ")", 'i');
  listings.forEach(function(listing) {
    if(_.find(listing.items, function(item) {
      var concatFields = '';
      _.each(fields, function(field) {
        concatFields += getFieldValue(item, field);
      });
      return regExp.test(concatFields);
    })) {
      matchingDocuments.push(listing);
    } else {
      return "false";
    }
  });
  return matchingDocuments;
};
