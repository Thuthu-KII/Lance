// Check if user is authenticated
// Update your auth.js middleware
exports.isAuthenticated = (req, res, next) => {
  console.log("isAuthenticated check:", req.isAuthenticated(), req.user);
  
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
  if (!req.isAuthenticated()) {
    req.flash('error_msg', 'Please log in to access this resource');
    return res.redirect('/auth/login');
  }
  
  if (req.user.role !== 'freelancer') {
    req.flash('error_msg', 'Access denied. Freelancer access only.');
    return res.redirect('/');
  }
  
  // Check if profile exists and is approved
  if (!req.user.profile) {
    req.flash('info_msg', 'Please complete your profile to continue');
    return res.redirect('/auth/complete-profile/freelancer');
  }
  
  if (!req.user.profile.is_approved) {
    req.flash('info_msg', 'Your account is pending approval by an administrator');
    return res.redirect('/freelancer/pending');
  }
  
  return next();
};

// Add to your auth.js middleware
// In your auth.js middleware
exports.checkFreelancerProfile = async (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'freelancer') {
    try {
      const db = require('../config/database');
      // Check if freelancer has a record in the freelancers table
      const result = await db.query(
        'SELECT * FROM freelancers WHERE user_id = $1',
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        console.log('No freelancer profile found, redirecting to complete profile');
        // No profile record found, redirect to complete profile
        req.flash('info_msg', 'Please complete your profile to continue');
        return res.redirect('/auth/complete-profile/freelancer');
      }
      
      // Add the profile to the user object
      req.user.profile = result.rows[0];
      next();
    } catch (error) {
      console.error('Error checking freelancer profile:', error);
      next(error);
    }
  } else {
    next();
  }
};