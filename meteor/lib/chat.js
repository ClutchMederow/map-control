Chat = {

  // This is the delimiter used when they enter text into the textarea
  // Stores an itemId between them
  imgDelimiter: '__img__',

  // This parses out all relevant items into an array
  // We do this to avoid publishing all items to the end user, and choose to denomalize
  parseChatText: function(input) {

    // Split the text string by the image delimiter
    // Then we will check each array item to see if it's an item id
    var inputArray = input.split(Chat.imgDelimiter);
    var items = [];

    var textArray = _.each(inputArray, function(stringFragment) {
      var item = Items.findOne(stringFragment);

      // If if is, save the item
      if (item) {
        items.push(item);
      }
    });

    return items;
  },

  // Takes a message document and returns a text string with HTML <img> tag for the item
  insertImagesForDisplay: function(doc) {
    try {

      // Finds all instances of __img__<image index>__img__
      var regexp = new RegExp('(' + Chat.imgDelimiter + '[\\s\\S]*?' + Chat.imgDelimiter + ')', 'ig');

      // Replace all instances with the actual image tag
      return doc.text.replace(regexp, function(foundIt) {
        var itemId = foundIt.replace(new RegExp(Chat.imgDelimiter, 'ig'), '');
        var item = _.findWhere(doc.items, { _id: itemId });

        // if the parsing is bad, just return a blank string instead of image
        if (item && item.iconURL) {
          return '<img src="' + item.iconURL + '" class="responsive-img chat-item">';
        } else {
          return '';
        }
      });

    } catch (e) {

      console.log(e);

      // If something really went wrong, just don't display the message
      return '<span class="msg-removed">message removed</span>';
    }
  }
};