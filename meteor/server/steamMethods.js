Meteor.methods({
  getPlayerInventory: function() {
    var user = Users.findOne(this.userId);

    if (this.userId && user) {
      return SteamAPI.getPlayerItems(user.services.steam.id, this.userId);
    } else {
      throw new Meteor.Error('NO_USER', 'User not found');
    }
  }
});
