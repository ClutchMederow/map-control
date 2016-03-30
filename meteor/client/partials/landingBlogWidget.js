Template.landingBlogWidget.helpers({
  log: function() {
    console.log(this);
  },
  getUrl: function() {
    return 'analysis/' + this.slug;
  },
});
