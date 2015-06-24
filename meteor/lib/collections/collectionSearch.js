// Retrieves the values from an object from the string representation
// Created to handle nested fields (e.g. 'profile.firstName')
function getFieldValue(obj, fieldString) {
  try {
    return fieldString.split('.').reduce(index, obj);
  } catch(e) {
    return '';
  }
}

//Reduce Function
function index(previousValue, currentValue, i, array) {
  return previousValue[currentValue];
}

// TODO: wrap these in object to protect global namespace
// This function applies a regex to all specified fields
// The 3rd+ arguements are the fields to include in the search
// ex: Meteor.users.searchFor({}, 'sally', 'profile.firstName', 'profile.lastName', 'profile.partnerOrg')
searchFor = function(selector, searchText, fields, options) {
  var out = this.find(selector, options).fetch();

  // Return all if no text included
  if (!searchText)
    return out;

  // Remove all non-alphanumeric characters
  var terms = searchText.replace(/\W/g,' ').trim().split(" ");
  var regExp = new RegExp("(?=.*" + terms.join(")(?=.*") + ")", 'i');

  // Retrieve all arguments past the first two
  // var fields = Array.prototype.slice.call(arguments,1);

  // For each document, concatenate all of the values from the specified fields and apply the regex
  return _.filter(out, function(doc) {
    var concatFields = '';
    _.each(fields, function(field) {
      concatFields += getFieldValue(doc,field);
    });
    return regExp.test(concatFields);
  });
};

searchForOne = function(selector, searchText, fields, options) {
  var result = this.searchFor(selector, searchText, fields, options);

  if (result)
    return result[0];
};

