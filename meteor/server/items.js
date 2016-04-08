Items._ensureIndex({ itemId: 1, unique: true });

//Note: this is probably just defensive programming, as I imagine
//the selector won't allow you to add more. But just in case...
Items.before.insert(function(userId, doc) {
  console.log(userId, doc);
  if(doc.name === IronBucks.name) {
    var user = Meteor.users.findOne(doc.userId);
    var totalIronBucks = user.profile.ironBucks;
    if(doc.amount > totalIronBucks) {
      console.log("Cannot trade more cash than you have");
      return false; //should stop insert
    }
  }
});
