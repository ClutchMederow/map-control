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
  'apiSecret': COINBASE_API_SECRET
});

Coinbase = {
  sendMoney: function(recipient, amount, currency, description) {
    var myAccounts = getAccounts();
    console.log(myAccounts);
    _.each(myAccounts, function(account) {
      if(account.primary) {
        var result = sendMoney(account, recipient, amount, currency, description);
      }
    });
  },
  createCheckout: function(amount, currency, name) {
    check(name, String);
    check(currency, String);
    check(amount, String);

    var checkout = createCheckout(client, amount, currency, name);
    return checkout.embed_code;
  }
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

function createCheckout(client, amount, currency, name) {
  var Future = Npm.require('fibers/future');
  var myFuture = new Future();

  client.createCheckout({
    amount: amount,
    currency: currency,
    name: name,
    type: "order",
    style: "buy_now_large",
    collect_email: true,
    collect_country: true
  }, function(err, res){
    if(err) {
      myFuture.throw(err);
    } else {
      console.log(res);
      myFuture.return(res);
    }
  });

  return myFuture.wait();
}
