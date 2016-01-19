// Always make sure that changing the items resets the trade state
RealTimeTrade.before.update(function(userId, doc, fieldNames, modifier, options) {
  if (fieldNames && _.intersection(fieldNames, [ 'user1Items', 'user2Items' ]).length > 0) {

    // double check to not change any states of confirmed trades
    if (doc.user1Stage === 'CONFIRMED' && doc.user2Stage === 'CONFIRMED') {
      return;
    }

    if (doc.user1Stage === 'DONE' || doc.user1Stage === 'CONFIRMED') {
      DB.setTradeStage(doc._id, "user1Stage", "TRADING");
    }

    if (doc.user2Stage === 'DONE' || doc.user2Stage === 'CONFIRMED') {
      DB.setTradeStage(doc._id, "user2Stage", "TRADING");
    }
  }
});
