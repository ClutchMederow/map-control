oeapikey = process.env.open_exchange_key ||
  (Meteor.settings && Meteor.settings.open_exchange_key);

sendTotalErrorEmail = function(userId) {
  var recepients = ['deltaveelabs@gmail.com', "therealdrewproud@gmail.com", 
    "duncanrenfrow@gmail.com"];
    var options = {
      from: "deltaveelabs@gmail.com",
      to: recepients,
      subject: "ERROR: Debits and Credits DO NOT match"
    };
    if(userId) {
      options.text = "Please immediately check the application. Financial totals did not match for userId: " + userId;
    } else {
      options.text = "Please immediately check the application. Financial totals did not match for the application";
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
    var sumDebits = 0;
    var sumCredits = 0;

    Logs.find().forEach(function(log) {
      if(log.type === Enums.LogType.CREDIT) {
        sumCredits = sumCredits + amount;
      }

      if(log.type === Enums.LogType.DEBIT) {
        sumDebits = sumDebits + amount;
      }
    });

    if(sumDebits + sumCredits === 0) {
      Logs.insert({
        type: Enums.LogType.AUDIT,
        date: new Date(),
        sumDebits: sumDebits,
        sumCredits: sumCredits
      });
    } else {
      //TODO: send email, text, log an anomalous event?
      //create ERROR event in log
      sendTotalErrorEmail();
    }
  }  
});
