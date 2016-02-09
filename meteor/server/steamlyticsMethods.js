Meteor.methods({
  //start, end: unix timestamps
  //period = daily, weekly, 30day
  //priceCutoff = filter to only all items >= priceCutoff
  getPricesOfItems: function(start, end, period, priceCutoff) {
    //TODO: secure this method
    check(start, Number);
    check(end, Number);
    check(period, String);
    check(priceCutoff, Number);
    console.log("Method Started");
    var items = PriceList.find({median_net_price: {$gt: priceCutoff}}).fetch();
    var timePeriod;
    if(period === "daily") {
      timePeriod = 60 * 60 * 24;
    } else if (period === "weekly") {
      timePeriod = 60 * 60 * 24 * 7;
    }  else if (period === "30day") {
      timePeriod = 60 * 60 * 24 * 30;
    } else {
      throw new Meteor.Error("INCORRECT_PARAMTERS", "Specify period as daily, weekly, or 30day");
    }

    var currentTimestamp = start;
    while(currentTimestamp < end) {
      console.log(currentTimestamp);
      _.each(items, function(item) {
      var endTimestamp = currentTimestamp + timePeriod;
        var result = SteamlyticsApi.getPrice(item.name, "mixed", 
          Math.round(currentTimestamp),
          Math.round(endTimestamp))
        result = _.extend(result, {startTime: currentTimestamp, 
        endTime: endTimestamp, name: item.name});
        HistoricalPriceData.insert(result);
      });

      currentTimestamp += timePeriod;
    }
    console.log("Method Finished");
  }
});
