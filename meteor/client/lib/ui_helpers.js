//handlebars supports iterating over object keys, but
////Meteor currently does not. This gives Meteor this ability
UI.registerHelper("arrayify", function(obj) {
    result = [];
    for (var key in obj) {
          result.push({name: key, value: obj[key]});
            
    }
      return result;

});

UI.registerHelper('formatDate', function(unformattedDate) {
    if(moment(unformattedDate).isValid()) {
      return moment(unformattedDate).format('MMMM DD h:mm A');
    } else {
      return "";
    }
});

UI.registerHelper('formatPrettyDate', function(unformattedDate) {
    if(moment(unformattedDate).isValid()) {
      return moment(unformattedDate).format('dddd, MMMM Do');
    } else {
      return "Invalid Date";
    }
});

UI.registerHelper('justTime', function(unformattedDate) {
    return moment(unformattedDate).format('h:mm A');
});

UI.registerHelper('pistols', function() {
  return GenericItems.find({item_type_name:"#CSGO_Type_Pistol"});
});

UI.registerHelper('rifles', function() {
  return GenericItems.find({item_type_name:"#CSGO_Type_Rifle"});
});

UI.registerHelper('smgs', function() {
  return GenericItems.find({item_type_name:"#CSGO_Type_SMG"});
});

UI.registerHelper('sniperRifles', function() {
  return GenericItems.find({item_type_name:"#CSGO_Type_SniperRifle"});
});

UI.registerHelper('machineGuns', function() {
  return GenericItems.find({item_type_name:"#CSGO_Type_Machinegun"});
});

UI.registerHelper('shotguns', function() {
  return GenericItems.find({item_type_name:"#CSGO_Type_Shotgun"});
});

UI.registerHelper('knives', function() {
  return GenericItems.find({item_type_name:"#CSGO_Type_Knife"});
});

UI.registerHelper('parseItemName', function(itemName) {
  return itemName.split('_WPNHUD_').pop();
});
