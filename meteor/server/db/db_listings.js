DB = DB || {};

DB.listings = {
  addListing: function(user,tradeItems, marketItems) {
    var datePosted = new Date();
    Listings.insert({
      user: user,
      items: tradeItems,
      request: marketItems,
      datePosted: datePosted
    });
  },

  removeListing: function(listingId) {
    Listings.remove({_id: listingId});
    //TODO: send notification to anyone watching this listing, etc.
  },

  cancelListingsForItems: function(items) {
    if (!items) return 0;

    check(items, [ Match.Any ]);

    // Ignore cash
    var items = _.reject(items, function(item) {
      return item.name === IronBucks.name;
    });

    if (!items.length) return 0;

    var selector = {
      'items._id': _.pluck(items, '_id'),
      closeDate: { $ne: null }
    };

    var doc = {
      $set: {
        closeDate: new Date(),
        closeReason: Enums.TradeCloseReason.ITEM_NOT_AVAILABLE
      }
    };

    return Listings.update(selector, doc, { multi: true });
  },
};
