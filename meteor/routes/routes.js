Router.route('/', function() {
  this.redirect('Trading Floor');
});

Router.route('/landing', {
  name: 'landing',
  template: 'landing'
});

Router.route('/chats', {
  name: 'chats',
  template: 'chats'
});

Router.route('/:channel',{
  name: 'chatWindow' ,
  template: 'chatWindow'
});
