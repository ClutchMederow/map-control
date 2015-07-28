Router.configure({
  layoutTemplate: 'layout'
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
  template: 'chatWindow'
});

Router.route('/makeOffer/:listingId', {
  name: 'makeOffer',
  template: 'makeOffer',
  data: function() {
    return Listings.findOne({_id: this.params.listingId});
  }
});

