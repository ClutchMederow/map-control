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

    return HTTP.post(callstring, options);
  },

  withdrawItems: function(userId, items) {

  },

  test: function(testing) {
    var callstring = DISPATCHER_API_URL + 'test';
    var options = {
      data: {
        testing: testing,
      }
    };

    return HTTP.post(callstring, options).data;
  },
};