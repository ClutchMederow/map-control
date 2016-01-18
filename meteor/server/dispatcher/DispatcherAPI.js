var DISPATCHER_API_URL = 'http://localhost:5080/dispatcher/';

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
        // testing: testing,
      }
    };

    return callBotServer(callstring, options);
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