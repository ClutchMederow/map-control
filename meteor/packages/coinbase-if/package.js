Package.describe({
  name: 'coinbase-if',
  version: '0.0.1',
  summary: 'Wrapper for Coinbase',
});


Package.onUse(function(api) {
  api.addFiles('coinbase-if.js', 'server');
  api.export('Coinbase', 'server');
});

Npm.depends({'coinbase': '2.0.0'});
