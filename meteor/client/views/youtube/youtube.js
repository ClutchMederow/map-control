var Channels = new Mongo.Collection(null);
var Videos = new Mongo.Collection(null);

var loadChannels = function(channelCategory, channelNames) {
  _.each(channelNames, function(channel) {
    YouTubeApi.getChannelId(channel, function(error, response) {
      if(error) {
        console.log(error);
      } else {
        getListOfVideos(channelCategory, response.items[0].id);
      }
    });
  });
};

var getListOfVideos = function(channelCategory, channelId, queryString, pageToken) {
  YouTubeApi.getListOfVideos(queryString, channelId, pageToken, 
    function(error, response) {
    if(error) {
      console.log(error);
    } else {
      //TODO: enforce that each channelCategory has only 1 doc of type "Metadata"
      //set meta-data
      Videos.remove({channelCategory: channelCategory, dataType: "Results"});
      var responseObject = {
        nextPageToken: response.nextPageToken,
        prevPageToken: response.prevPageToken,
        pageInfo: response.pageInfo,
        queryString: queryString,
        channelId: channelId
      };
      Videos.upsert({channelCategory: channelCategory, dataType: "Metadata"},
                    {$push: {pages: responseObject}}
                   );
      _.each(response.items, function(item) {
        var videoId = Videos.insert({channelCategory: channelCategory, 
                                    dataType: "Results",
                                    video: item});
        YouTubeApi.getVideoDetails(item.id.videoId, function(error, response) {
          if(error) {
            console.log(error);
          } else {
            Videos.update(videoId, {$set: {videoDetails: response.items[0]}});
          }
        });
      });
    }
  });
};

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}

Template.youtube.onRendered(function() {
   $('ul.tabs').tabs();
   //load youtube player
   var tag = document.createElement('script');

   tag.src = "https://www.youtube.com/iframe_api";
   var firstScriptTag = document.getElementsByTagName('script')[0];
   firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

   //load google apis for youtube Data API
   $.getScript("https://apis.google.com/js/client.js?onload=OnLoadCallback", 
     function(data, textStatus, httpCode) {
       if(textStatus === "success") {
         YouTubeApi.initialize(function() {
           //requires channelId
           _.each(Config.youtube, function(channelNames, key, list) {
             loadChannels(key, channelNames);
           });
           
           //does not require channelId
           getListOfVideos("Skins", null, "csgo skins");
           getListOfVideos("winterUpdate", null, "cs go winter update");
         });

       } else {
         sAlert.error("Could not load videos");
       }
   });
});

Template.youtube.helpers({
  getVideos: function(channelCategory) {
    //TODO: make Enum
    return Videos.find({channelCategory: channelCategory, dataType: "Results"});
  }

});

Template.youtube.events({
  //TODO: dry out the next and prev functions below
  'click .next':function(e) {
    e.preventDefault();
    var channel = this.toString();
    var metadata = Videos.findOne({channelCategory: channel,
      dataType: "Metadata"});
      Videos.remove({channelCategory: channel, dataType: "Metadata"});
      _.each(metadata.pages, function(page) {
        //channelCategroy, channelId, queryString
        getListOfVideos(channel, page.channelId, page.queryString, 
                        page.nextPageToken);
      });
  },
  'click .prev':function(e) {
    e.preventDefault();
    var channel = this.toString();
    var metadata = Videos.findOne({channelCategory: channel,
      dataType: "Metadata"});
      Videos.remove({channelCategory: channel, dataType: "Metadata"});
      _.each(metadata.pages, function(page) {
        //channelCategroy, channelId, queryString
        getListOfVideos(channel, page.channelId, page.queryString, 
                        page.prevPageToken);
      });
  },
  //TODO: on hover, make the player light up. 
  //TODO: on click, make it light up and the screen scroll to the top
  'click .thumbnail': function(e) {
    //getting to the tab parent
    var tabId = "#" + e.target.parentNode.parentNode.parentNode.getAttribute("id");
    $( "#player" ).remove();
    $( tabId ).prepend("<div id='player'></div>");
    if(player) {
      player.clearVideo();  
    }
    var player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: this.video.id.videoId,
      events: {
        'onReady': onPlayerReady,
        //'onStateChange': onPlayerStateChange
      }
    });       
  }
});
