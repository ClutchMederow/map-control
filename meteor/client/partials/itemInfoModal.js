Template.itemInfoModal.helpers({
  existsValue: function(value) {
    var newValue = value.trim();
    //is it an empty string, if not don't show it
    return !_.isEmpty(value);
  }
});