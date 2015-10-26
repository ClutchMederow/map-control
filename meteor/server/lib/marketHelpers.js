//taken from:
//http://stackoverflow.com/questions/8672383/how-to-use-underscores-intersection-on-objects
_.intersectionObjects = function(array) {
  var slice = Array.prototype.slice; // added this line as a utility
  var rest = slice.call(arguments, 1); //grabs other array
  //look at each uniq value of first array
  //go through all items of second array
  //check to see if any (some) of elements are equal to each other
  //only returns items that match (i.e. intersection)
  return _.filter(_.uniq(array), function(item) {
    return _.every(rest, function(other) { //this goes through each of multiple arrays passed  in
      return _.any(other, function(element) {  //this then compares elements of each array to original
        return _.isEqual(element, item);
      });
    });
  });
};

MarketHelper = {
  checkInventoryForItems: function(userId, requestedItems) {
    var stashItems = Items.find({ userId: userId, deleteInd: false, status: Enums.ItemStatus.STASH }).fetch();
    //the requestedItems should be a subset of the player posting a trade
    //request's stash items. So we can check to see if intersection
    //of stashItems and requestedItems is equal to requestedItems
    var intersection = _.intersectionObjects(stashItems, requestedItems);
    if(_.isEqual(intersection, requestedItems)) {
      return true;
    } else {
      return false;
    }
  }
};
