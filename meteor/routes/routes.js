Router.route('/', function() {
  this.redirect('Trading Floor');
});

Router.route('/chats', {
  name: 'chats',
  template: 'chats'
});

Router.route('/:channel',{
  name: 'chatWindow' ,
  template: 'chatWindow'
});
