oeapikey = process.env.open_exchange_key ||
  (Meteor.settings && Meteor.settings.open_exchange_key);

//setup pricing chron job
SyncedCron.add({
  name: 'Update pricing information',
  schedule: function(parser) {
    return parser.text('every 1 hours');
  },

  job: function() {
    var steamlyticsApi = SteamlyticsApi;
    var price = null;
    Items.find().forEach(function(item) {
      var itemPrice = ItemPrices.findOne({ name: item.name });
      if(itemPrice) {
        if(itemPrice.upToDate) {
          console.log(name + "'s price is  already up to date");
        } else {
          price = steamlyticsApi.getPrice(itemPrice.name);
          //note: returned object from api doesn't include market item name
          price.name = itemPrice.name;
          price.uptToDate = true;
          ItemPrices.update(itemPrice._id, price);
        }
      } else {
          price = steamlyticsApi.getPrice(itemPrice.name);
          //note: returned object from api doesn't include market item name
          price.name = itemPrice.name;
          price.upToDate = false;
          ItemPrices.insert(price);
      }
    });

    console.log("job complete");
    //set all items to false
    ItemPrices.update({}, {$set: {upToDate: false}}, {multi: true});
  }
});
