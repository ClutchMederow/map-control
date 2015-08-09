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

Router.route('/chats', {
  name: 'chats',
  template: 'chats'
});

Router.route('/steam', {
  name: "configureLoginServiceDialogForSteam",
  template: "configureLoginServiceDialogForSteam"
});

Router.route('/memberHomePage', {
  name: 'memberHomePage',
  template: 'memberHomePage'
});

Router.route('/realTimeTrading/:tradeId', {
  name: 'realTimeTrading',
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

Router.route('/myinventory', {
  name: 'myInventory',
  template: 'myInventory'
});

Router.route('/myTransactions/:userId', {
  name: 'myTransactions',
  template: 'myTransactions',
  data: function() {
    return {userId: this.params.userId};
  }
});

Router.route('/posttraderequest', {
  name: 'postTradeRequest',
  template: 'postTradeRequest'
});

Router.route('/stripepayment', {
  name: 'stripePayment',
  template: 'stripePayment'
});

Router.route('/tradingFloor/:channel',{
  name: 'chatWindow' ,
  template: 'chatWindow',
  action: function() {
    if (this.ready()) {
      this.render();
    }
  }
});

Router.route('/makeOffer/:listingId', {
  name: 'makeOffer',
  template: 'makeOffer',
  data: function() {
    return Listings.findOne({_id: this.params.listingId});
  }
});

