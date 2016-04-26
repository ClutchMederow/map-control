AnalyticsHelpers = (function() {
  
  //note: items here is actually value of date: item pair
  //by signature of mapObject iteratee
  var getItemsByRarity = function(items) {

    return R.compose(
      R.map((item) => _.groupBy(item, 'name')),
      R.groupBy(R.prop('rarity'))
    )(items);
  };

  var csgoItemsArbitrageFormat = function() {
    var csgoItems = _.indexBy(CSGOItems.find().fetch(), 'market_hash_name');
    const priceList = PriceList.find({historicalData: false}).fetch();
    return R.compose(
      R.map(getItemsByRarity),
      R.groupBy((price) => moment(price.timestamp).format("MM/DD/YYYY")),
      R.map(price => ({...price, rarity: csgoItems[price.name].quality_color}))
    )(priceList);
  };

  return {
    //insert all items in arbitrage format
    //{timestamp: {quality: {name: { pricingData } } } } 
    //into a collection
    insertItemsArbitrageFormat: function() {
      return csgoItemsArbitrageFormat();
    },

    testSearch: function() {
      var csgoItems = _.indexBy(CSGOItems.find().fetch(), 'market_hash_name');
      var countOfMissing = 0;
      PriceList.find({historicalData: false}).forEach(function(price) {
        if(!csgoItems[price.name]) {
          countOfMissing++;
        }
      });

      return countOfMissing;
    }
  }
})();

