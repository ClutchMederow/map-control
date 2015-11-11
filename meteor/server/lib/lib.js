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
    return parser.text('every 1 hours');
  },

  job: function() {
    var steamlyticsApi = SteamlyticsApi;
    var price = null;
    Items.find().forEach(function(item) {

      // ignore ironbucks
      if (item.name === IronBucks.name) return;

      var itemPrice = ItemPrices.findOne({ name: item.name });
      if(itemPrice) {
        if(itemPrice.upToDate) {
          console.log(name + "'s price is  already up to date");
        } else {
          price = steamlyticsApi.getPrice(itemPrice.name);
          //note: returned object from api doesn't include market item name
          price.name = itemPrice.name;
          price.uptToDate = true;
          ItemPrices.update(itemPrice._id, price);
        }
      } else {
          price = steamlyticsApi.getPrice(itemPrice.name);
          //note: returned object from api doesn't include market item name
          price.name = itemPrice.name;
          price.upToDate = false;
          ItemPrices.insert(price);
      }
    });

    console.log("job complete");
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
