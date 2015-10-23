var COINBASE_API_KEY = process.env.COINBASE_API_KEY ||
  (Meteor.settings && Meteor.settings.coinbase_api_key);

var COINBASE_API_SECRET = process.env.COINBASE_API_SECRET ||
  (Meteor.settings && Meteor.settings.coinbase_api_secret);


if(!COINBASE_API_KEY || !COINBASE_API_SECRET) {
  throw new Error("COINBASE_API_KEY or COINBASE_API_SECRET not set in Meteor.settings or in environment variable");
}

var coinbase = Npm.require('coinbase');
var client = new coinbase.Client({
  'apiKey': COINBASE_API_KEY,
  'apiSecret': COINBASE_API_SECRET,
  'baseApiUri': "https://api.sandbox.coinbase.com/v2/",
  'tokenUri': 'https://api.sandbox.coinbase.com/oauth/token'
});

Coinbase = {
  send: function(recipient, amount, currency, description) {
    check(recipient, String);
    check(amount, String);
    check(currency, String);
    check(description, String);
    var myAccounts = getAccounts();
    console.log(myAccounts);
    _.each(myAccounts, function(account) {
      if(account.primary) {
        var result = sendMoney(account, recipient, amount, currency, description);
      }
    });
  },
};

function getAccounts() {
  var Future = Npm.require('fibers/future');
  var myFuture = new Future();

  client.getAccounts({}, function(err, accounts) {
    if(err) {
      myFuture.throw(err);
    } else {
      myFuture.return(accounts);
    }
  });

  return  myFuture.wait();
}

function sendMoney(account, recipient, amount, currency, description) {
  var Future = Npm.require('fibers/future');
  var myFuture = new Future();

  account.sendMoney({
    "to": recipient,
    "amount": amount,
    "currency": currency,
    "description": description
  }, function(err, txn) {
    if (err) {
      myFuture.throw(err);
    } else {
      console.log('my txn id is: ' + txn.id);
      myFuture.return(txn);
    }
  });

  return myFuture.wait();
}
