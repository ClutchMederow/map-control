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

Router.route('/market', {
  name: 'market', 
  template: 'market'
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

Router.route('/mylistings', {
  name: 'myListings',
  template: 'myListings'
});

Router.route('/tradingFloor/:channel',{
  name: 'chatWindow' ,
  template: 'chatWindow'
});

