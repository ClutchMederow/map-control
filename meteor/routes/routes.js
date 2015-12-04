Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: "notFound"
});

Router.route('/content', {
  name: 'content',
  template: 'content'
});

Router.route('/help', {
  name: 'help',
  template: 'help'
});

Router.route('/learn', {
  name: 'learn',
  template: 'learn'
});

Router.route('/bitcoin', {
  name: 'bitcoin',
  template: 'bitcoin'
});

Router.route('/ironbucks', {
  name: 'ironBucks',
  template: 'ironBucks'
});

Router.route('/ironbucks/add', {
  name: 'addIronBucks',
  template: 'addIronBucks'
});

Router.route('/ironbucks/withdraw', {
  name: 'withdrawIronBucks',
  template: 'withdrawIronBucks'
});

Router.route('/webhooks/coinbase', function() {
  var coinbaseSecret = this.request.query.coinbasesecret;

  var COINBASE_SECRET = process.env.coinbase_callback_secret ||
    (Meteor.settings && Meteor.settings.coinbase_callback_secret);

  if(coinbaseSecret === COINBASE_SECRET) {
    DB.updateIronBucksCallback(this.request);

    this.response.statusCode = 200;
    this.response.end('complete');
  } else {
    this.response.statusCode = 403;
    this.response.end('forbidden');
  }
}, {
  name: 'webhooksCoinbase',
  where: 'server'
});

Router.route('/contact', {
  name: 'contact',
  template: 'contact'
});

Router.route('/about', {
  name: 'about',
  template: 'about'
});

Router.route('/faq', {
  name: 'faq',
  template: 'faq'
});

Router.route('/', {
  name: 'landing',
  template: 'landing'
});

Router.route('/chats', {
  name: 'chats',
  template: 'chats'
});


Router.route('/steam', {
  name: "configureLoginServiceDialogForSteam",
  template: "configureLoginServiceDialogForSteam"
});

Router.route('/home', {
  name: 'home',
  template: 'home',
  action: function() {
    if(Meteor.user().profile.firstTimeUser) {
      this.redirect('tour');
    } else {
      this.render('home');
    }
  }
});

Router.route('/tour', {
  name: 'tour',
  template: 'tour'
});

Router.route('/notifications', {
  name: 'notifications',
  template: 'notifications'
});

Router.route('/market/:userId', {
  name: 'market',
  template: 'market',
  data: function() {
    if (this.params.userId.toLowerCase() === 'all') {
      return {};
    } else {
      return {userId: this.params.userId};
    }
  }
});

Router.route('/inventory', {
  name: 'inventory',
  template: 'myInventory',
  onBeforeAction: function() {
    var userId = Meteor.userId();

    if (Items.find({ userId: userId, deleteInd: false, status: Enums.ItemStatus.STASH }).count()) {
      this.next();
    } else {
      this.redirect('manageStash');
    }
  }
});

Router.route('/transactions/:userId', {
  name: 'transactions',
  template: 'myTransactions',
  data: function() {
    return {userId: this.params.userId};
  }
});


Router.route('/managestash', {
  name: 'manageStash',
  template: 'manageStash'
});

Router.route('/profile', {
  name: 'profile',
  template: 'profile'
});

Router.route('/tradingfloor/:channel?',{
  name: 'tradingFloor' ,
  template: 'tradingFloor',
  onBeforeAction: function() {
    if (!this.params.channel) {
      this.redirect('tradingFloor', { channel: Config.tradingFloor.defaultChannel });
    } else {
      this.next();
    }
  },
  action: function() {
    if (this.ready()) {
      this.render();
    }
  }
});

Router.route('/offer/:listingId', {
  name: 'makeOffer',
  template: 'makeOffer',
  data: function() {
    return Listings.findOne({_id: this.params.listingId});
  }
});

