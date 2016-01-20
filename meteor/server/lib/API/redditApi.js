RedditApi = (function() {
  
  searchReddit = function(sort, limit, time) {
    var results = [];
    var baseString = "https://www.reddit.com/r/"

    console.log(baseString);

    _.each(Config.reddit.subreddits, function(subreddit) {
      var callString = baseString+subreddit + "/" + sort + "/?sort=" + sort + "&" + "t=" & time + "&limit=" + limit;
      console.log(callString);
      //console.log(HTTP.get(callString));
    })
  }

  return {
    getTrending: function() {
      searchReddit("top", 50, "all");
    }
  }
})();



