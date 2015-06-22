Meteor.startup(function() {
  //setup steam api
  configureSteam = function(config) {
    ServiceConfiguration.configurations.upsert(
      {service: "steam"},
      {
        $set: {
          loginStyle: config.loginStyle, //NOTE: changing to redirect causes bug right now 
          apiKey: config.apiKey
        }
    });
  };

  var steamConfig = Meteor.settings.steam;
  if(steamConfig) { 
    configureSteam(steamConfig);
  } else {
    console.log("You do not have steam service configured");
  }

  //Fixture data

  Factory.define('message', Messages, {
    text: function() {
      return Fake.sentence();
    },
    channel: 'Trading Floor'
  });

  Factory.define('channel', Channels, {
    name: function() {
      return Fake.word();
    }
  });

  //Inventory Items
  var itemClasses = ['Rifle', 'Pistol', 'SMG', 'Sniper Rifle'];
  Factory.define('item', InventoryItems, {
    name: function() {
      return Fake.word();
    }, 
    itemId: function() {
      return Fake.word();
    },
    classId: function() {
      return Fake.word();
    },
    type: function() {
      return Fake.fromArray(itemClasses);
    },
    deleteInd: false 
  });

  //TODO: put in dev / production flag here
  if (Messages.find().count() === 0) {
    _(10).times(function(n) {
      Factory.create('message');
    });
  }

  if (Channels.find().count() === 0) {
    Channels.insert({name: 'Trading Floor'});
    _(5).times(function(n) {
      Factory.create('channel');
    });
  }

  if (InventoryItems.find().count() === 0) {
    _(100).times(function(n) {
      Factory.create('item');
    });
  }
});
