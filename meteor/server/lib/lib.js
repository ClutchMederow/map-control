oeapikey = process.env.open_exchange_key ||
  (Meteor.settings && Meteor.settings.open_exchange_key);

getAdminUser = function() {
  var adminName = Meteor.settings.adminUser.userName;
  return Meteor.users.findOne({"profile.name": adminName});
};

//checks to see if there are sufficient ironBucks
sufficientIronBucks = function(userId, amount) {
  var user = Meteor.users.findOne(userId);
  if(user.profile.ironBucks >= amount) {
    return true;
  } else {
    return false;
  }
};

getItemPrice = function(item, itemPrice) {
  check(item, Object);

  var steamlyticsApi = SteamlyticsApi;
  const price = steamlyticsApi.getPrice(item.name);
  //note: returned object from api doesn't include market item name
  price.name = item.name;
  price.upToDate = true;

  if (itemPrice) {
    ItemPrices.update(itemPrice._id, price);
  } else {
    ItemPrices.insert(price);
  }

  return updateItemPrices(item._id, price); //de-normalizing
};

//given an itemId and a price object,
//set the price equal to that object
updateItemPrices = function(itemId, prices) {
  Items.update(itemId, {$set: {prices: prices}});
};

sendTotalErrorEmail = function(logId, withdrawalObject, userId) {
  var recepients = ['deltaveelabs@gmail.com', "therealdrewproud@gmail.com",
    "duncanrenfrow@gmail.com"];
    var options = {
      from: "deltaveelabs@gmail.com",
      to: recepients,
      subject: "ERROR: Debits and Credits DO NOT match"
    };
    if(userId) {
      options.text = "Please immediately check the application. " +
        "Financial totals did not match for userId: " + userId +
        ". The descrepancy was: " + withdrawalObject.total;
    } else {
      options.text = "Please immediately check the application. " +
        "Financial totals did not match for the application" +
        ". The descrepancy was: " + withdrawalObject.total;
    }
    Email.send(options);
};

//setup pricing chron job
SyncedCron.add({
  name: 'Update pricing information',
  schedule: function(parser) {
    return parser.text('every 30 minutes');
  },

  job: function() {
    var price = null;
    Items.find().forEach(function(item) {

      // ignore ironbucks
      if (item.name === IronBucks.name) return;

      var itemPrice = ItemPrices.findOne({ name: item.name });
      //if object exists
      if(_.isObject(itemPrice)) {
        //if item price up to date
        if(itemPrice.upToDate) {
          console.log(item.name + "'s price is  already up to date");
        } else { //if item price not up to date
          getItemPrice(item, itemPrice);
        }
      } else { //if item doesn't exist
        getItemPrice(item, itemPrice);
      }
    });

    console.log("Pricing job complete");
    //set all items to false
    ItemPrices.update({}, {$set: {upToDate: false}}, {multi: true});
  }
});


//checks to make sure credits / debits in sync. Sends an alert / email if not
SyncedCron.add({
  name: 'Check debits & credits',
  schedule: function(parser) {
    return parser.text('every 1 hours');
  },
  job: function() {

    var withdrawalObject = checkWithdrawal();

    var logData = withdrawalObject;
    logData.date = new Date();
    //TODO: adjust this with a threshold to account
    //for small rounding errors?
    if(withdrawalObject.total === 0) {
      logData.type = Enums.LogType.AUDIT;

      Logs.insert(logData);
    } else {
      logData.type = Enums.LogType.ERROR;
      var logId = Logs.insert(logData);

      sendTotalErrorEmail(logId, withdrawalObject);
    }
  }
});

//call the price list every 25 hours
SyncedCron.add({
  name: "Get updated price list",
  schedule: function(parser) {
    return parser.text('every 25 hours');
  },
  job: function() {
    //set all "current" data to be historical, then add new data (whose
    //historical data flag is false)
    console.log("Updating price list");
    var numberUpdates = PriceList.update({historicalData: false}, {$set: {historicalData: true}}, {multi: true});
    console.log("Updated " + numberUpdates + " of documents");
    SteamlyticsApi.getPricelist();
  }
})
