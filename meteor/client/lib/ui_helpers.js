//handlebars supports iterating over object keys, but
////Meteor currently does not. This gives Meteor this ability
UI.registerHelper("arrayify", function(obj) {
    result = [];
    for (var key in obj) {
          result.push({name: key, value: obj[key]});
            
    }
      return result;

});
