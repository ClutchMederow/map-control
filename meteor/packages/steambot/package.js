Package.describe({
  name: 'drewproud:steambot',
  version: '0.0.1',
  summary: '',
  git: '',
  documentation: ''
});

Npm.depends({
  'steam': '0.6.7',
  'steam-tradeoffers': '1.2.3',
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use('underscore', 'server');
  api.addFiles('steambot.js');
  api.export('SteamBot');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('drewproud:steambot');
  api.addFiles('steambot-tests.js');
});
