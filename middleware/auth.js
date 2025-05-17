// Check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please log in to view this resource');
  res.redirect('/auth/login');
};

// Check if user is a client
exports.isClient = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'client') {
    return next();
  }
  req.flash('error_msg', 'Access denied. Client access only.');
  res.redirect('/');
};

// Check if user is a freelancer
exports.isFreelancer = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'freelancer') {
    return next();
  }
  req.flash('error_msg', 'Access denied. Freelancer access only.');
  res.redirect('/');
};

// Check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Access denied. Admin access only.');
  res.redirect('/');
};

// Check if a freelancer is approved
exports.isApprovedFreelancer = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'freelancer') {
    if (req.user.profile && req.user.profile.is_approved) {
      return next();
    }
    req.flash('error_msg', 'Your account is pending approval by an administrator.');
    res.redirect('/freelancer/pending');
  } else {
    req.flash('error_msg', 'Access denied. Approved freelancer access only.');
    res.redirect('/');
  }
};