var metadata = ReactiveVar();
var hasNext = new ReactiveVar();
var hasPrev = new ReactiveVar();

Template.pagination.onRendered(function() {
  var self = this;
  Tracker.autorun(function () {
    hasNext.set(false);
    hasPrev.set(false);
    metadata.set(Videos.findOne({channelCategory: self.data,
                                dataType: "Metadata"}));
  });
});

Template.pagination.helpers({
  hasNext: function() {
    if(metadata.get()) {
      _.each(metadata.get().pages, function(page) {
        if(page.nextPageToken) {
          hasNext.set(true);
        }
      });
    }
    return hasNext.get();
  },
  hasPrev: function() {
    if(metadata.get()) {
      _.each(metadata.get().pages, function(page) {
        if(page.prevPageToken) {
          hasPrev.set(true);
        }
      });
    }
    return hasPrev.get();
  }
});
