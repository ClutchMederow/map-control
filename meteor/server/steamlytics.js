//IIFE to protect any private vars
SteamlyticsApi = (function() {
  var apiKey = Meteor.settings.steamlyticsApiKey;

  return {
    //marketHashName = human readable name from Staem,
    //e.g. "Operation Phoenix Weapon Case"
    //source = 0 for steam community market only
    //from, to = UNIX timestamps to restrict data
    getPrice: function(marketHashName, source, from, to) {
      var url = "http://csgo.steamlytics.xyz/api/v1/prices/" +
        marketHashName + "?key=" + apiKey;
      try {
        var results = HTTP.get(url);
        return results.data;
      } catch(e) {
        return false;
      }
    },
    //limit = number of results to return
    getPopular: function(limit) {
      var url = "";
      if(limit) {
         url = "http://csgo.steamlytics.xyz/api/v1/items/popular?limit=" +
          limit + "&key=" + apiKey;
      } else {
         url = "http://csgo.steamlytics.xyz/api/v1/items/popular?" +
           "key=" + apiKey;
      }
      try {
        var results = HTTP.get(url);
        return results.data;
      } catch(e) {
        return false;
      }
    },
    getPricelist: function() {
      var url = "http://csgo.steamlytics.xyz/api/v1/pricelist";
      try {
        var results = HTTP.get(url, {params: {key: apiKey }});
        var timestamp = Date.now(); //UTC timestamp
        _.each(results.data.items, function(item) {
          item = _.extend(item, {timestamp: timestamp})
          item.median_net_price = parseFloat(item.median_net_price);
          PriceList.insert(item);
        });
      } catch(e) {
        throw new Meteor.Error("STEAMLYTICS_API_ERROR", "The api call to Pricelist failed");
      }

    }
  };
})();
