var DISPATCHER_API_URL = Meteor.settings.botServer.url;

// NOTE
// USE this.unblock() to allow other calls to be made while awaiting a response

DispatcherAPI = {
  depositItems: function(userId, items) {
    var callstring = DISPATCHER_API_URL + 'deposit';
    var options = {
      data: {
        userId: userId,
        items: items,
      }
    };

    return callBotServer(callstring, options).tradeofferId;
  },

  withdrawItems: function(userId, items) {
    var callstring = DISPATCHER_API_URL + 'withdraw';
    var options = {
      data: {
        userId: userId,
        items: items,
      }
    };

    return callBotServer(callstring, options).tradeofferId;
  },

  test: function(testing) {
    var callstring = DISPATCHER_API_URL + 'test';
    var options = {
      data: {
        testing: testing,
      }
    };

    return callBotServer(callstring, options);
  },
};

function callBotServer(callstring, options) {
  var username = Meteor.settings.botServer.username;
  var password = Meteor.settings.botServer.password;
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
    throw e;
  }
}