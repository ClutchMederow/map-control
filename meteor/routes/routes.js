Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/faq', {
  name: 'faq',
  template: 'faq'
});

Router.route('/', {
  name: 'landing',
  template: 'landing'
});

Router.route('/initialsignup', {
  name: 'initialSignup',
  template: 'initialSignup'
});

Router.route('/signup', {
  name: 'signup',
  template: 'signup'
});

Router.route('/sellersignup', {
  name: 'sellerSignup',
  template: 'sellerSignup'
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
  template: 'home'
});

Router.route('/realtime/:tradeId', {
  name: 'realtime',
  template: 'realTimeTrading',
  data: function() {
    return RealTimeTrade.findOne(this.params.tradeId);
  },
  action: function() {
    if(this.ready()) {
      this.render();
    }
  }
});

Router.route('/notifications', {
  name: 'notifications',
  template: 'notifications'
});

Router.route('/market/:userId', {
  name: 'market',
  template: 'market',
  data: function() {
    if(this.params.userId === 'All') {
      return {};
    } else {
      return {userId: this.params.userId};
    }
  }
});

Router.route('/inventory', {
  name: 'inventory',
  template: 'myInventory'
});

Router.route('/transactions/:userId', {
  name: 'transactions',
  template: 'myTransactions',
  data: function() {
    return {userId: this.params.userId};
  }
});

Router.route('/list', {
  name: 'list',
  template: 'postTradeRequest'
});

Router.route('/stripepayment', {
  name: 'stripePayment',
  template: 'stripePayment'
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

//TODO: setup webhooks on stripe
Router.route('/webhooks/stripe', function() {
  var request = this.request.body;

  switch(request.type){
    case "invoice.payment_succeeded":
      stripeCreateInvoice(request.data.object);
    break;
    //TODO: add additional ones here
  }

  this.response.statusCode = 200;
  this.response.end('Oh hai Stripe!\n');
}, {where: 'server'});

