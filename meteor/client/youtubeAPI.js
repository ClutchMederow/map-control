YouTubeApi = (function() {
  var apiKey = "AIzaSyAypc74Tmhr-FFmYBnvoqaRvO6LlimTfWA";
  var baseEndpoint = "https://www.googleapis.com/youtube/v3/videos";
  
  return {
    initialize: function(callback) {
      gapi.client.setApiKey(apiKey);
      gapi.client.load("youtube","v3").then(function() {
        callback();
      });
    },

    getChannelId: function(channelName, callback) {
      var paramList = {
        part: "id",
        forUsername: channelName,
      };
      
      var request = gapi.client.youtube.channels.list(paramList);

      request.execute(function(response){
        //TODO: handle errors here
        if(response.items.length === 0) {
          callback("NO ITEMS FOUND", null);
        } else {
          callback(null, response);
        }
      });

    },

    getListOfVideos: function(queryString, channelId, callback) {
      //Note: due to the API restrictions, you have to 
      //search for a list of videos, then 
      //use their ids to search for viewcounts

      var paramList = {};
      if(queryString) {
        paramList = _.extend(paramList, {q: queryString});
      }

      if(channelId) {
        paramList = _.extend(paramList, {channelId: channelId});
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
        //handle errors
        callback(null, response);
      });
    }   
  };
})();
