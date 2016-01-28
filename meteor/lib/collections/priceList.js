PriceList = new Mongo.Collection("priceList");

EasySearch.createSearchIndex('priceListIndex', {
  'collection': PriceList,
  'field': ['name'],
  'use': 'mongo-db',
  'sort': function() {
    return {median_net_price: -1}
  },
  'props': {
    'sort': function() {
      return {volume: -1}
    } 
  },
  'query': function(searchString, opts) {
    var query = EasySearch.getSearcher(this.use).defaultQuery(this, searchString); 
    query.historicalData = false;
    return query;
  }
})
