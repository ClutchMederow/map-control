//Following module pattern
SteamAPI = (function () {
  //Private variables and functions
  var csContextId = 2; //2 = games
  var csAppId = 730; //730 = CSGO
  var apiKey = Meteor.settings.steam.apiKey;   
  var steamCDN = "http://steamcommunity-a.akamaihd.net/economy/image/";
  
  var parseSteamAPIInventory = function(data,userId ) {
    var rgInventory = data.rgInventory;      
    var rgDescriptions = data.rgDescriptions;
    _.each(rgInventory, function(item) {
      var itemDescription = rgDescriptions[item.classid + "_" + item.instanceid];
      //TODO: put this through DB layer
      InventoryItems.insert({
        userId: userId,
        name: itemDescription.market_name,
        nameColor: itemDescription.name_color,
        backgroundColor: itemDescription.background_color,
        type: itemDescription.type,
        descriptions: itemDescription.descriptions,
        tags: itemDescription.tags,
        itemId: item.id,
        amount: item.amount,
        marketable: itemDescription.marketable,
        tradable: itemDescription.commodity,
        classId: item.classid,
        instanceId: item.instanceid,
        iconURL: steamCDN + itemDescription.icon_url,
        deleteInd: false
       });
    });
  };
  //declaration of all functions, best practice due to hoisting
  var getPlayerInventory = function(profileId, userId) {
      var inventoryData;
      var callString = "http://steamcommunity.com/profiles/" + profileId + 
      "/inventory/json/" + csAppId + "/" + csContextId;
      try {
        inventoryData = HTTP.get(callString).data;
      } catch(error) {
        console.log(error.stack);
        throw new Meteor.Error("HTTP_REQUEST_FAILURE", "Could not retrieve player's inventory");
      }
      //clear and remove inventory,
      //do this after API call to avoid lag
      InventoryItems.remove({}); 
      parseSteamAPIInventory(inventoryData, userId);
  };



  //Public variables
  return {
    getAllItemsForPlayer: function(profileId, userId) {
      return getPlayerInventory(profileId, userId);
    },
      //check that item exists OR the amount of that item has incremented 1
      //check that item doesn't exist OR that amount of item has decremented 1
      //is there risk that a different trade happens between establishing # of
      //items pre-trade and then verifying trade?
      //Note it is up to calling function to check each item swap
    tradeCompletedSuccessfully: function(itemId, senderOriginalItemCount, receiverOriginalItemCount, senderId, receiverId) {
      //get count of item post-trade
      var senderInventory = getPlayerInventory(senderId).rgInventory;
      var senderItemCount = parseInt(_.find(senderInventory, function(item) {
        return itemId === item.id;
      }).amount, 10);  //amount is stored as string for some reason

      var receiverInventory = getPlayerInventory(receiverId).rgInventory;
      var receiverItemCount = parseInt(_.find(receiverInventory, function(item) {
        return itemId === item.id;
      }).amount, 10);  //amount is stored as string for some reason
      
      if((senderItemCount < senderOriginalItemCount) && (receiverItemCount > receiverOriginalItemCount)) {
        return true;
      } else {
        return false;
      }
    }
  };
}) (); //Immediately Invoked Function that returns object