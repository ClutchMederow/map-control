//Following module pattern
SteamAPI = (function () {
  //Private variables and functions
  var csContextId = 2; //2 = games
  var csAppId = 730; //730 = CSGO
  var apiKey = Meteor.settings.steam.apiKey;   
  var steamCDN = "http://steamcommunity-a.akamaihd.net/economy/image/";
  
  //declaration of all functions, best practice due to hoisting
  var getPlayerInventory = function(profileId) {
      var inventoryData;
      var callString = "http://steamcommunity.com/profiles/" + profileId + 
      "/inventory/json/" + csAppId + "/" + csContextId;
      try {
        inventoryData = HTTP.get(callString).data;
      } catch(error) {
        console.log(error.stack);
        throw new Meteor.Error("HTTP_REQUEST_FAILURE", "Could not retrieve player's inventory");
      }
      return inventoryData;
  };



  //Public variables
  return {
    getAllItemsForPlayer: function(profileId) {
      return getPlayerInventory(profileId);
    },
    verifyItemTraded: function(item, profile1, profile2) {

    }
  };
}) (); //Immediately Invoked Function that returns object
