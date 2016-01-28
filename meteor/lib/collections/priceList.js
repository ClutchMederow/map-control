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
  }
})
