Meteor.startup(function() {
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
});
