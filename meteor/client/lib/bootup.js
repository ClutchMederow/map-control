Meteor.startup(function () {
    sAlert.config({
        effect: '',
        position: 'top-left',
        timeout: 5000,
        html: false,
        onRouteClose: true,
        stack: true,
        offset: 0
    });
});
