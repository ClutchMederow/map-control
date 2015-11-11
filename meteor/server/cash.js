//given a trade and a user, check to see if that users items contain cash
//if they do, check the flag 
//deny trades where both users have cash in their items
allowTrade = function(trade, user) {
  var userItems;
  check(user, ["user1Items", "user2Items"]);
  if(user === "user1") {
    userItems = "user1Items";
  } else {
    userItems = "user2Items";
  }   

  var cashInItems = function() {

    _.each(trade[userItems], function(item) {
      if(item.name === IronBucks.name) {
        return true;
      }
    });
    return false; //no cash found
  };

  if(cashInItems) {
    if(trade.cashAdded) {
      //don't allow trade because they're adding cash to a 
      //trade that already has cash in it
      return false;
    } else {
      //allow the trade to proceed, but update the trade to indicate it has cash
      RealTimeTrade.update(trade._id, {$set: {hasCash: true}});
      return true;
    }
  } else {
    //no cash in items, trade can proceed
    return true;
  }
};
