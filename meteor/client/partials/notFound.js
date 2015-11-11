Template.notFound.onRendered(function() {
  Meteor.setTimeout(function() {
    Router.go('home');
  }, 3000);
});
