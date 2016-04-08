/* global Tradeoffers */
/* global ItemPrices */
/* global _ */

var DISPATCHER_API_URL = process.env.BOT_SERVER_URL;

// NOTE
// USE this.unblock() to allow other calls to be made while awaiting a response

function updatePriceForSingleItem(item) {
  const itemPrice = ItemPrices.findOne({name: item.name});
  if(_.isObject(itemPrice)) {
    console.log("updating item with price");
    updateItemPrices(item._id, itemPrice);
  } else {
    console.log("Getting item price...");
    getItemPrice(item, null);
  }
}

function updateItemPricesForTradeoffer(tradeofferId) {
  const offer = Tradeoffers.findOne({ tradeofferid: tradeofferId });
  const assetIds = _.pluck(offer.items_to_receive, 'assetid');
  Items.find({ itemId: { $in: assetIds }}).forEach(updatePriceForSingleItem);
}

// TODO: tradeoffer doesn't have the items to receive yet

DispatcherAPI = {
  depositItems: function(userId, items) {
    var callstring = DISPATCHER_API_URL + 'deposit';
    var options = {
      data: {
        userId: userId,
        items: items,
      }
    };

    const tradeofferId = callBotServer(callstring, options, 3).tradeofferId;
    updateItemPricesForTradeoffer(tradeofferId);

    return tradeofferId;
  },

  withdrawItems: function(userId, items) {
    var callstring = DISPATCHER_API_URL + 'withdraw';
    var options = {
      data: {
        userId: userId,
        items: items,
      }
    };

    return callBotServer(callstring, options, 3).tradeofferId;
  },

  test: function(testing) {
    var callstring = DISPATCHER_API_URL + 'test';
    var options = {
      data: {
        testing: testing,
      }
    };

    return callBotServer(callstring, options, 3);
  },
};

function callBotServer(callstring, options, retryCount) {
  var username = process.env.BOT_SERVER_USERNAME;
  var password = process.env.BOT_SERVER_PASSWORD;
  var authString = username + ':' + password;

  if (!username || !password) {
    throw new Error('No botServer username or password');
  }

  options.auth = authString;

  try {
    var res = HTTP.post(callstring, options);

    if (res.statusCode === 200) {
      return res.data;
    } else {
      throw new Error('Bad status code: ' + res.statusCode);
    }
  } catch (e) {
    var errCode = e.response.content;
    var errForClient = Enums.MeteorError[errCode]

    if (errForClient) {
      throw new Meteor.Error(errForClient);
    }

    if (retryCount > 0) {
      return callBotServer(callstring, options, retryCount - 1);
    }

    throw e;
  }
}