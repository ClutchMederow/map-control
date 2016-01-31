PriceList = new Mongo.Collection("priceList");

EasySearch.createSearchIndex('priceListIndex', {
  'collection': PriceList,
  'field': ['name'],
  'use': 'mongo-db',
  'sort': function(searchString) {
    if (this.props.orderBy) {
      if (this.props.orderBy === 'price') {
        return {'median_net_price': -1};
      } else {
        return {'volume': -1};
      }
    }
  },
  'props': {
      'orderBy': 'price'
  },
  'query': function(searchString, opts) {
    var query = EasySearch.getSearcher(this.use).defaultQuery(this, searchString); 
    query.historicalData = false;
    return query;
  }
})
