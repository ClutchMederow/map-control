AnalyticsHelpers = (function() {

  const rarityArray = [
    "EB4B4B",
    "4B69FF",
    "8847FF",
    "D32CE6",
    "5E98D9",
    "B0C3D9",
    "E4AE39"
  ];

  //get the expected value of a rarity over a given time period
  //divide by number of days you have prices for
  //output {rarity: {value, time period}}

  function mergeAccAndDate(acc, value) {
    return R.mergeWith(R.mergeWith((acc, item) => acc.average_net_price + item.average_net_price));
  }

  // { 'Factory New': sadf, : } { factory new': 
  //note: beginnningTimeStamp is in seconds, so add 3 0's to it
  function mergeAllItems(beginningTimeStamp) {
    //for each day, 
    //see if there is price data for that tier
    //if there is, sum up the value 
    //add it to 
    const averageValues = function(valueList) {
      R.compose(
        R.converge(R.divide,[R.prop('value'),R.prop('count')]),
        R.reduce((acc,val) => ({count: acc.count + 1, value: acc.value + val}, {count: 0, value: 0}))
      )(valueList);
    };

    const msTimeStamp = beginningTimeStamp * 1000;
    var getAvgPricePerRarity = function(itemsByName) {
      return R.compose(
        averageValues,
        R.pluck('median_price')
      )(itemsByName);
    };

    const results = CSGOItemsArbitrageFormat.find({_id: {$gt: msTimeStamp}}).map(
        function(dailyPriceData) {
          return R.compose(
            R.map(val => [val]),
            R.map(getAvgPricePerRarity),
            R.pickAll(rarityArray)
          )(dailyPriceData);
      })
      .reduce(R.mergeWith(R.concat), {});

    console.log(results);
  }
  
  
  //note: items here is actually value of date: item pair
  //by signature of mapObject iteratee
  var getItemsByRarity = function(items) {

    return R.compose(
      R.map((item) => _.groupBy(item, (x) => x.name.replace(/\./g, ","))),
      R.groupBy(R.prop('rarity'))
    )(items);
  };

  var csgoItemsArbitrageFormat = function() {
    var csgoItems = _.indexBy(CSGOItems.find().fetch(), 'market_hash_name');
    const priceList = PriceList.find({timestamp: {$gt: 1459123200}}).fetch();
    return R.compose(
      R.map(getItemsByRarity),
      R.groupBy((price) => moment(price.timestamp).format("MM/DD/YYYY")),
      R.map(price => ({...price, rarity: R.propOr({quality_color: "Bad"},price.name,csgoItems).quality_color}))
    )(priceList);
  };

  return {
    //insert all items in arbitrage format
    //{timestamp: {quality: {name: { pricingData } } } } 
    //into a collection
    insertItemsArbitrageFormat: function() {
      _.each(csgoItemsArbitrageFormat(), function(item, key) {
        CSGOItemsArbitrageFormat.insert({_id: key, ...item});
      });
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
    },

    testCalc: function() {
      return mergeAllItems();
    },

  }
})();

