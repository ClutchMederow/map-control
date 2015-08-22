Chat = {
  imgDelimiter: '__img__',

  dbImageDelimiter: '__dbimg__',

  // This parses out all embedded images into an array of iconURLs and replaces them with denoted indices
  // We do this to avoid publishing all items to the end user, and indstead just store the
  // url (which comes directly from our DB to avoid attacks)
  parseChatText: function(input) {
    // This should be in here, but let's sanitize it just in case
    var scrubbedInput = input.replace(Chat.dbImageDelimiter, '');

    // Split the text string by the image delimiter
    // Then we will check each array item to see if it's an item id
    var inputArray = scrubbedInput.split(Chat.imgDelimiter);

    var index = 0;
    var imageUrls = [];

    var textArray = _.map(inputArray, function(stringFragment) {
      var item = Items.findOne(stringFragment);

      // If the fragment was an id, replace it with an delimited index
      if (item) {

        // Push the URL to the array and save the index in the string
        imageUrls[index] = item.iconURL;
        var parsed = Chat.dbImageDelimiter + index + Chat.dbImageDelimiter;
        index++;

        return parsed;

      } else {

        // Otherwise return the text fragment
        return stringFragment.trim();
      }
    });

    return {
      text: textArray.join(' '),
      imageUrls: imageUrls
    };
  },

  // Takes a message document and returns a text string with HTML <img> tag for the item
  insertImagesForDisplay: function(doc) {
    try {

      // Finds all instances of __dbimg__<image index>__db__
      var regexp = new RegExp('(' + Chat.dbImageDelimiter + '[\\s\\S]*?' + Chat.dbImageDelimiter + ')', 'ig');

      // Replace all instances with the actual image tag
      return doc.text.replace(regexp, function(foundIt) {
        var imageIndex = foundIt.replace(new RegExp(Chat.dbImageDelimiter, 'ig'), '');
        var indInteger = parseInt(imageIndex);

        // if the parsing is bad, just return a blank string instead of image
        if (!isNaN(indInteger) && doc.imageUrls && indInteger < doc.imageUrls.length) {
          return '<img src="' + doc.imageUrls[imageIndex] + '" class="responsive-img chat-item">';
        } else {
          return '';
        }
      });

    } catch (e) {

      // If something really went wrong, just don't display the message
      return '<span class="msg-removed">message removed</span>';
    }
  }
};