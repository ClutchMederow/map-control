GenericFilter = function(item) {
  this.filterTerms = [];
  this.dep = new Deps.Dependency();
};

GenericFilter.prototype.add = function(item) {
  if (!_.findWhere(this.filterTerms, { name: item.name })) {
    this.filterTerms.push(item);
    this.dep.changed();
  }
};

GenericFilter.prototype.remove = function(item) {
  var name = item.name;
  var itemToRemove = _.findWhere(this.filterTerms, { name: name });

  if (itemToRemove) {
    this.filterTerms = _.without(this.filterTerms, itemToRemove);
    this.dep.changed();
  }
};

GenericFilter.prototype.get = function() {
  this.dep.depend();
  return this.filterTerms;
};

GenericFilter.prototype.getName = function() {
  this.dep.depend();
  return _.pluck(this.filterTerms, 'name');
};