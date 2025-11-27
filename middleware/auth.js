// Middleware to check if user is authenticated
const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

// Middleware to check if user is a guest (not authenticated)
const ensureGuest = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/neighborhood');
};

// Middleware to check if user has completed their profile
const ensureProfileComplete = (req, res, next) => {
  if (req.isAuthenticated() && req.user.hasCompletedProfile) {
    return next();
  }

  if (req.isAuthenticated() && !req.user.hasCompletedProfile) {
    return res.redirect('/signup/address');
  }

  res.redirect('/');
};

// Middleware to check if user needs to complete profile
const ensureProfileIncomplete = (req, res, next) => {
  if (req.isAuthenticated() && !req.user.hasCompletedProfile) {
    return next();
  }

  if (req.isAuthenticated() && req.user.hasCompletedProfile) {
    return res.redirect('/neighborhood');
  }

  res.redirect('/');
};

module.exports = {
  ensureAuth,
  ensureGuest,
  ensureProfileComplete,
  ensureProfileIncomplete,
};
