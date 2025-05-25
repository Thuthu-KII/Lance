/**
 * Role-based access control middleware
 */

// Check if user has admin role
exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Access denied. Admin privileges required.');
  res.redirect('/');
};

// Check if user has client role
exports.isClient = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'client') {
    return next();
  }
  req.flash('error_msg', 'Access denied. Client account required.');
  res.redirect('/');
};

// Check if user has freelancer role
exports.isFreelancer = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'freelancer') {
    return next();
  }
  req.flash('error_msg', 'Access denied. Freelancer account required.');
  res.redirect('/');
};

// Check if freelancer is approved
exports.isApprovedFreelancer = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'freelancer') {
    if (req.user.profile && req.user.profile.is_approved) {
      return next();
    }
    req.flash('error_msg', 'Your account is pending approval by an administrator.');
    res.redirect('/freelancer/pending');
  } else {
    req.flash('error_msg', 'Access denied. Approved freelancer account required.');
    res.redirect('/');
  }
};

// Check if user owns a specific job (for clients)
exports.isJobOwner = async (req, res, next) => {
  try {
    if (!req.isAuthenticated() || req.user.role !== 'client') {
      req.flash('error_msg', 'Access denied.');
      return res.redirect('/');
    }
    
    const jobId = req.params.id || req.params.jobId;
    const clientId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Require database access
    const db = require('../config/database');
    
    const result = await db.query(
      'SELECT * FROM jobs WHERE id = $1 AND client_id = $2',
      [jobId, clientId]
    );
    
    if (result.rows.length === 0) {
      req.flash('error_msg', 'Access denied. You do not own this job.');
      return res.redirect('/client/jobs');
    }
    
    // Add job to req object for later use
    req.job = result.rows[0];
    next();
  } catch (error) {
    console.error('Error in isJobOwner middleware:', error);
    req.flash('error_msg', 'An error occurred while checking job ownership.');
    res.redirect('/client/jobs');
  }
};

// Check if user has applied to a specific job (for freelancers)
exports.hasAppliedToJob = async (req, res, next) => {
  try {
    if (!req.isAuthenticated() || req.user.role !== 'freelancer') {
      req.flash('error_msg', 'Access denied.');
      return res.redirect('/');
    }
    
    const jobId = req.params.id || req.params.jobId;
    const freelancerId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Require database access
    const db = require('../config/database');
    
    const result = await db.query(
      'SELECT * FROM job_applications WHERE job_id = $1 AND freelancer_id = $2',
      [jobId, freelancerId]
    );
    
    if (result.rows.length === 0) {
      req.flash('error_msg', 'You have not applied to this job.');
      return res.redirect('/jobs/' + jobId);
    }
    
    // Add application to req object for later use
    req.application = result.rows[0];
    next();
  } catch (error) {
    console.error('Error in hasAppliedToJob middleware:', error);
    req.flash('error_msg', 'An error occurred while checking job application.');
    res.redirect('/freelancer/applications');
  }
};

// Check if user is hired for a job (for freelancers)
exports.isHiredForJob = async (req, res, next) => {
  try {
    if (!req.isAuthenticated() || req.user.role !== 'freelancer') {
      req.flash('error_msg', 'Access denied.');
      return res.redirect('/');
    }
    
    const jobId = req.params.id || req.params.jobId;
    const freelancerId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Require database access
    const db = require('../config/database');
    
    const result = await db.query(
      'SELECT * FROM job_applications WHERE job_id = $1 AND freelancer_id = $2 AND status = $3',
      [jobId, freelancerId, 'hired']
    );
    
    if (result.rows.length === 0) {
      req.flash('error_msg', 'You are not hired for this job.');
      return res.redirect('/freelancer/applications');
    }
    
    // Add application to req object for later use
    req.application = result.rows[0];
    next();
  } catch (error) {
    console.error('Error in isHiredForJob middleware:', error);
    req.flash('error_msg', 'An error occurred while checking job status.');
    res.redirect('/freelancer/applications');
  }
};