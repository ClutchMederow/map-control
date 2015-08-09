Accounts.onCreateUser(function(options, user) {
  if (options.profile) {
    user.profile = options.profile;
  } else {
    user.profile = {};
  }
  user.profile.firstLoggedIn = true;
  return user;
});
