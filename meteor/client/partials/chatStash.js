Template.chatStash.helpers({
  stashOptions: function() {
    var userId = Meteor.userId();

    return {
      items: Items.find({ userId: userId, status: Enums.ItemStatus.STASH, deleteInd: false }).fetch(),
      columns: '6',
      // class: 'add-remove-items',
      ready: true
    };
  }
});

Template.chatStash.events({
  'click #toggle-chat-stash': function(e) {
    e.preventDefault();
    $('#chat-stash').toggleClass('active-chat-stash');
  },

  'click #chat-stash .close-link': function(e) {
    e.preventDefault();
    $('#chat-stash').removeClass('active-chat-stash');
  },
});
