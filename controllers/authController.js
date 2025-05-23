const passport = require('passport');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Login page
exports.getLogin = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('auth/login');
};

// Process login
exports.postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error_msg', info.message);
      return res.redirect('/auth/login');
    }
    
    req.logIn(user, (err) => {
      if (err) return next(err);
      if (user.role === 'client') {
        
        return res.redirect('/client/dashboard');
       
      } else if (user.role === 'freelancer') {
        return res.redirect('/freelancer/dashboard');
      } else if (user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      }
      
      return res.redirect('/');
    });
  })(req, res, next);
};

// Registration page
exports.getRegister = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('auth/register');
};

// Client registration page
exports.getRegisterClient = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('auth/register-client');
};

// Freelancer registration page
exports.getRegisterFreelancer = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('auth/register-freelancer');
};

// Process client registration
exports.postRegisterClient = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName, companyName, phone, address } = req.body;
  let skills = req.body.skills ? req.body.skills.split(',').map(skill => skill.trim()) : [];
  const experience = req.body.experience || '';
  let cvPath = req.file ? `/uploads/cvs/${req.file.filename}` : '';
  
  const errors = [];
  
  // Validate inputs
  if (!email || !password || !confirmPassword || !firstName || !lastName) {
    errors.push({ message: 'Please fill in all required fields' });
  }
  
  if (password.length < 6) {
    errors.push({ message: 'Password should be at least 6 characters' });
  }
  
  if (password !== confirmPassword) {
    errors.push({ message: 'Passwords do not match' });
  }
  
  // Check if email is already registered
  const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  
  if (emailCheck.rows.length > 0) {
    errors.push({ message: 'Email is already registered' });
  }
  
  if (errors.length > 0) {
    return res.render('auth/register-client', {
      errors,
      email,
      firstName,
      lastName,
      companyName,
      phone,
      address,
      skills: skills.join(', '),
      experience
    });
  }
  
  // If all validations pass, create new client
  try {
    const client = await db.getClient();
    await client.query('BEGIN');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const userInsert = await client.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, 'client']
    );
    
    const userId = userInsert.rows[0].id;
    
    // Insert client profile
    await client.query(
      'INSERT INTO clients (user_id, first_name, last_name, company_name, phone, address, skills, experience, cv_path) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [userId, firstName, lastName, companyName, phone, address, skills, experience, cvPath]
    );
    
    await client.query('COMMIT');
    client.release();
    
    req.flash('success_msg', 'You are now registered as a client. Please log in');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error_msg', 'Registration failed. Please try again.');
    res.redirect('/auth/register-client');
  }
};

// Process freelancer registration
exports.postRegisterFreelancer = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName, phone, address } = req.body;
  let skills = req.body.skills ? req.body.skills.split(',').map(skill => skill.trim()) : [];
  const experience = req.body.experience || '';
  
  // Get file paths
  let cvPath = req.files && req.files.cv ? `/uploads/cvs/${req.files.cv[0].filename}` : '';
  let clearancePath = req.files && req.files.clearance ? `/uploads/clearances/${req.files.clearance[0].filename}` : '';
  
  const errors = [];
  
  // Validate inputs
  if (!email || !password || !confirmPassword || !firstName || !lastName) {
    errors.push({ message: 'Please fill in all required fields' });
  }
  
  if (!req.files || !req.files.clearance || !req.files.cv) {
    errors.push({ message: 'Please upload both a CV and police clearance certificate' });
  }
  
  if (password.length < 6) {
    errors.push({ message: 'Password should be at least 6 characters' });
  }
  
  if (password !== confirmPassword) {
    errors.push({ message: 'Passwords do not match' });
  }
  
  // Check if email is already registered
  const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  
  if (emailCheck.rows.length > 0) {
    errors.push({ message: 'Email is already registered' });
  }
  
  if (errors.length > 0) {
    return res.render('auth/register-freelancer', {
      errors,
      email,
      firstName,
      lastName,
      phone,
      address,
      skills: skills.join(', '),
      experience
    });
  }
  
  // If all validations pass, create new freelancer
  try {
    const client = await db.getClient();
    await client.query('BEGIN');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const userInsert = await client.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, 'freelancer']
    );
    
    const userId = userInsert.rows[0].id;
    
    // Insert freelancer profile
    await client.query(
      'INSERT INTO freelancers (user_id, first_name, last_name, phone, address, skills, experience, cv_path, clearance_path, is_approved) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [userId, firstName, lastName, phone, address, skills, experience, cvPath, clearancePath, false]
    );
    
    await client.query('COMMIT');
    client.release();
    
    req.flash('success_msg', 'You are now registered as a freelancer. An admin will review your application.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error_msg', 'Registration failed. Please try again.');
    res.redirect('/auth/register-freelancer');
  }
};

// Google OAuth callback
exports.googleCallback = (req, res) => {
  if (req.user.tempUser) {
    // Store temp user data in session and redirect to role selection
    req.session.tempUser = req.user;
    return res.redirect('/auth/select-role');
  }
  
  // Regular user - redirect based on role
  if (req.user.role === 'client') {
    return res.redirect('/client/dashboard');
  } else if (req.user.role === 'freelancer') {
    return res.redirect('/freelancer/dashboard');
  } else if (req.user.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }
  
  return res.redirect('/');
};

// Role selection page for Google OAuth users
exports.getSelectRole = (req, res) => {
  if (!req.session.tempUser) {
    return res.redirect('/auth/login');
  }
  
  res.render('auth/select-role', { user: req.session.tempUser });
};

// Process role selection
exports.postSelectRole = (req, res) => {
  const { role } = req.body;
  const tempUser = req.session.tempUser;
  
  if (!tempUser) {
    return res.redirect('/auth/login');
  }
  
  if (role === 'client') {
    return res.redirect('/auth/complete-profile/client');
  } else if (role === 'freelancer') {
    return res.redirect('/auth/complete-profile/freelancer');
  } else {
    req.flash('error_msg', 'Invalid role selected');
    return res.redirect('/auth/select-role');
  }
};

// Complete client profile for OAuth users
exports.getCompleteClientProfile = (req, res) => {
  if (!req.session.tempUser) {
    return res.redirect('/auth/login');
  }
  
  res.render('auth/complete-profile-client', { user: req.session.tempUser });
};

// Process client profile completion
exports.postCompleteClientProfile = async (req, res) => {
  const tempUser = req.session.tempUser;
  
  if (!tempUser) {
    return res.redirect('/auth/login');
  }
  
  const { firstName, lastName, companyName, phone, address } = req.body;
  let skills = req.body.skills ? req.body.skills.split(',').map(skill => skill.trim()) : [];
  const experience = req.body.experience || '';
  let cvPath = req.file ? `/uploads/cvs/${req.file.filename}` : '';
  
  const errors = [];
  
  // Validate inputs
  if (!firstName || !lastName) {
    errors.push({ message: 'Please fill in all required fields' });
  }
  
  if (errors.length > 0) {
    return res.render('auth/complete-profile-client', {
      errors,
      user: tempUser,
      firstName,
      lastName,
      companyName,
      phone,
      address,
      skills: skills.join(', '),
      experience
    });
  }
  
  // Create user and profile
  try {
    const client = await db.getClient();
    await client.query('BEGIN');
    
    // Insert user
    const userInsert = await client.query(
      'INSERT INTO users (email, role, google_id) VALUES ($1, $2, $3) RETURNING id',
      [tempUser.email, 'client', tempUser.google_id]
    );
    
    const userId = userInsert.rows[0].id;
    
    // Insert client profile
    await client.query(
      'INSERT INTO clients (user_id, first_name, last_name, company_name, phone, address, skills, experience, cv_path) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [userId, firstName || tempUser.first_name, lastName || tempUser.last_name, companyName, phone, address, skills, experience, cvPath]
    );
    
    await client.query('COMMIT');
    client.release();
    
    // Clear temp user and login
    delete req.session.tempUser;
    
    // Login the new user
    const user = {
      id: userId,
      email: tempUser.email,
      role: 'client',
      google_id: tempUser.google_id
    };
    
    req.login(user, (err) => {
      if (err) {
        req.flash('error_msg', 'Error logging in. Please try again.');
        return res.redirect('/auth/login');
      }
      
      req.flash('success_msg', 'Profile completed successfully');
      return res.redirect('/client/dashboard');
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    req.flash('error_msg', 'Profile completion failed. Please try again.');
    res.redirect('/auth/complete-profile/client');
  }
};

// Complete freelancer profile for OAuth users
exports.getCompleteFreelancerProfile = (req, res) => {
  if (!req.session.tempUser) {
    return res.redirect('/auth/login');
  }
  
  res.render('auth/complete-profile-freelancer', { user: req.session.tempUser });
};

// Process freelancer profile completion
exports.postCompleteFreelancerProfile = async (req, res) => {
  const tempUser = req.session.tempUser;
  
  if (!tempUser) {
    return res.redirect('/auth/login');
  }
  
  const { firstName, lastName, phone, address } = req.body;
  let skills = req.body.skills ? req.body.skills.split(',').map(skill => skill.trim()) : [];
  const experience = req.body.experience || '';
  
  // Get file paths
  let cvPath = req.files && req.files.cv ? `/uploads/cvs/${req.files.cv[0].filename}` : '';
  let clearancePath = req.files && req.files.clearance ? `/uploads/clearances/${req.files.clearance[0].filename}` : '';
  
  const errors = [];
  
  // Validate inputs
  if (!firstName || !lastName) {
    errors.push({ message: 'Please fill in all required fields' });
  }
  
  if (!req.files || !req.files.clearance || !req.files.cv) {
    errors.push({ message: 'Please upload both a CV and police clearance certificate' });
  }
  
  if (errors.length > 0) {
    return res.render('auth/complete-profile-freelancer', {
      errors,
      user: tempUser,
      firstName,
      lastName,
      phone,
      address,
      skills: skills.join(', '),
      experience
    });
  }
  
  // Create user and profile
  try {
    const client = await db.getClient();
    await client.query('BEGIN');
    
    // Insert user
    const userInsert = await client.query(
      'INSERT INTO users (email, role, google_id) VALUES ($1, $2, $3) RETURNING id',
      [tempUser.email, 'freelancer', tempUser.google_id]
    );
    
    const userId = userInsert.rows[0].id;
    
    // Insert freelancer profile
    await client.query(
      'INSERT INTO freelancers (user_id, first_name, last_name, phone, address, skills, experience, cv_path, clearance_path, is_approved) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [userId, firstName || tempUser.first_name, lastName || tempUser.last_name, phone, address, skills, experience, cvPath, clearancePath, false]
    );
    
    await client.query('COMMIT');
    client.release();
    
    // Clear temp user
    delete req.session.tempUser;
    
    req.flash('success_msg', 'Profile completed successfully. An admin will review your application.');
    return res.redirect('/auth/login');
  } catch (error) {
    console.error('Profile completion error:', error);
    req.flash('error_msg', 'Profile completion failed. Please try again.');
    res.redirect('/auth/complete-profile/freelancer');
  }
};

// Logout
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/');
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
  });
};