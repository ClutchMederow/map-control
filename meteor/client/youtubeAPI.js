YouTubeApi = (function() {
  var apiKey = "AIzaSyAypc74Tmhr-FFmYBnvoqaRvO6LlimTfWA";
  var baseEndpoint = "https://www.googleapis.com/youtube/v3/videos";
  
  //TODO: put in config the search terms, etc. 

  var channelList = [];
  
  return {
    initialize: function() {
      gapi.client.setApiKey(apiKey);
      gapi.client.load("youtube","v3").then(function() {
        console.log("loaded");
      });
    },

    insertChannel: function(channelName, callback) {
      var paramList = {
        part: "id",
        forUserName: channelName,
      };
      
      var request = gapi.client.youtube.channels.list(paramList);

      request.execute(function(response, callback){
        callback(error, response);
      });

    },

    getListOfVideos: function(queryString, channelIds, callback) {
      //Note: due to the API restrictions, you have to 
      //search for a list of videos, then 
      //use their ids to search for viewcounts

      var paramList = {};
      if(queryString) {
        paramList = _.extend(paramList, {q: queryString});
      }

      if(channelIds) {
        paramList = _.extend(paramList, {channelId: channelIds });
      }

      var twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      paramList = _.extend(paramList, {
        part: "snippet",
        type: "video",
        publishedAfter: twoWeeksAgo.toISOString(),
        order: "date",
      });

      //Probably want to grab description, title, and thumbnail
      //on click of thumbnail, boot up youtube iframe?
      var request = gapi.client.youtube.search.list(paramList);
      request.execute(function(response){
        callback(response);
      });
    }   
  };
})();
