Template.message.helpers({
  getImage: function() {
    if (this.user && this.user.avatar) {
      return this.user.avatar.small;
    }
  },

  textWithImages: function() {
    return Spacebars.SafeString(Chat.insertImagesForDisplay(this));
  },
});

