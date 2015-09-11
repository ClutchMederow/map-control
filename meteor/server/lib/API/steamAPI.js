//Following module pattern
SteamAPI = (function () {
  //Private variables and functions
  var csContextId = 2; //2 = games
  var csAppId = 730; //730 = CSGO
  var apiKey = Meteor.settings.steam.apiKey;
  var steamCDN = "http://steamcommunity-a.akamaihd.net/economy/image/";

  var parseSteamAPIInventory = function(data, userId) {
    var parsed = data;

    var rgInventory = parsed.rgInventory;
    var rgDescriptions = parsed.rgDescriptions;

    return _.map(rgInventory, function(item) {
      var itemDescription = rgDescriptions[item.classid + "_" + item.instanceid];

      return {
        userId: userId,
        name: itemDescription.market_name,
        nameColor: itemDescription.name_color,
        backgroundColor: itemDescription.background_color,
        type: itemDescription.type,
        descriptions: itemDescription.descriptions,
        tags: itemDescription.tags,
        itemId: item.id,
        amount: Number(item.amount),
        marketable: itemDescription.marketable,
        tradable: itemDescription.commodity,
        classId: item.classid,
        instanceId: item.instanceid,
        iconURL: steamCDN + itemDescription.icon_url,
        status: Enums.ItemStatus.EXTERNAL,
        deleteInd: false
       };
    });
  };

  //declaration of all functions, best practice due to hoisting
  //profileID = steam public id (base 64)
  //userId = Meteor user ID
  var getPlayerInventory = function(userId) {

    var profileId = Meteor.users.findOne(userId).services.steam.id;

    var inventoryData;
    var callString = "http://steamcommunity.com/profiles/" + profileId +
    "/inventory/json/" + csAppId + "/" + csContextId;

    inventoryData = HTTP.get(callString).data;

    if(!inventoryData.success) {
      console.log('Failed to load');
      throw new Meteor.Error("INVENTORY FAILED TO LOAD", inventoryData.failed);
    } else {
      //clear and remove inventory for a specific user,
      //do this after API call to avoid lag
      return parseSteamAPIInventory(inventoryData, userId);
    }
  };

  //Public variables
  return {
    getAllItemsForPlayer: function(userId) {
      return getPlayerInventory(userId);
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
    },

    getPlayerItems: function(profileId) {
      var callString = "http://steamcommunity.com/profiles/" + profileId +
      "/inventory/json/" + csAppId + "/" + csContextId;
      var data = HTTP.get(callString).data;
      return data;
    },

    getGenericItems: function() {
      var callString = "https://api.steampowered.com/IEconItems_730/GetSchema/v0002/?key=" + apiKey;
      try {
        var items = HTTP.get(callString).data.result.items;
        _.map(items, function(item) {
          //TODO: remove this and include crates and keys
          if(item.craft_class === 'weapon') {
            GenericItems.insert(item);
          }
        });
      } catch(error) {
        console.log(error.stack);
        throw new Meteor.Error("HTTP_REQUEST_FAILURE", "Could not retrieve generic inventory");
      }
    }
  };
}) (); //Immediately Invoked Function that returns object
