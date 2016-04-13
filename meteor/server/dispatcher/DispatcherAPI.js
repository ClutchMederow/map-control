/* global Tradeoffers */
/* global ItemPrices */
/* global _ */
/* global DB */
/* global Constants */
/* global Enums */
/* global getItemPrice */
/* global updateItemPrices */
/* global Items */

var DISPATCHER_API_URL = process.env.BOT_SERVER_URL;

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
    }
    throw new Error('Bad status code: ' + res.statusCode);
  } catch (e) {
    var errCode = e.response ? e.response.content : null;
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

function sendInventoryNotification(userId, tradeofferId, message) {
  const link = Constants.tradeOfferURL + tradeofferId;
  const data = {
    alertType: Constants.inventoryManagementTemplate,
    tradeofferId: tradeofferId,
    link: link,
  };
  DB.addNotification(userId, message, data);
}

function sendErrorNotification(userId, message) {
  const data = {
    alertType: 'botError',
  };
  DB.addNotification(userId, message, data);
}

// TODO: tradeoffer doesn't have the items to receive yet

DispatcherAPI = {
  depositItems: function(userId, items) {
    var callstring = DISPATCHER_API_URL + 'deposit';
    var options = {
      data: {
        userId: userId,
        items: items,
      },
    };

    try {
      const tradeofferId = callBotServer(callstring, options, 3).tradeofferId;

      updateItemPricesForTradeoffer(tradeofferId);
      sendInventoryNotification(userId, tradeofferId, 'Please click accept to deposit items');
      return tradeofferId;
    } catch (err) {
      console.log('Bot server error:' + err);
      console.log(userId);
      console.log(items);
      sendErrorNotification(userId, 'There was a error with our bot server. Please try again later.');
      throw err;
    }
  },

  withdrawItems: function(userId, items) {
    var callstring = DISPATCHER_API_URL + 'withdraw';
    var options = {
      data: {
        userId: userId,
        items: items,
      },
    };

    try {
      const tradeofferId = callBotServer(callstring, options, 2).tradeofferId;
      sendInventoryNotification(userId, tradeofferId, 'Please click accept to withdraw items');
      return tradeofferId;
    } catch (err) {
      console.log('Bot server error:' + err);
      console.log(userId);
      console.log(items);
      sendErrorNotification(userId, 'There was a error with our bot server. Please try again later.');
      throw err;
    }
  },

  test: function(testing) {
    var callstring = DISPATCHER_API_URL + 'test';
    var options = {
      data: {
        testing: testing,
      },
    };

    return callBotServer(callstring, options, 2);
  },
};
