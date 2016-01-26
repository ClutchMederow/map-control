Template.layout.helpers({
  isLanding: function() {
    return Router.current().route.getName() === 'landing';
  },
});