//Following module pattern
SteamAPI = (function () {
  //Private variables and functions
  var csContextId = 2; //2 = games
  var csAppId = 730; //730 = CSGO
  var apiKey = Meteor.settings.steam.apiKey;   
  var steamCDN = "http://steamcommunity-a.akamaihd.net/economy/image/";
  
  //declaration of all functions, best practice due to hoisting
  http://steamcommunity.com/profiles/76561197965124635/inventory/json/730/2

  //Public variables
  return {
    getPlayerItems: function(profileId) {
      var callString = "http://steamcommunity.com/profiles/" + profileId + 
      "/inventory/json/" + csAppId + "/" + csContextId;
      console.log(callString);
      var data = HTTP.get(callString).data;
      return data;
    },
    checkTrade: function() {

    }
  };
}) (); //Immediately Invoked Function that returns object
