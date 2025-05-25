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
      address
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
      'INSERT INTO clients (user_id, first_name, last_name, company_name, phone, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [userId, firstName, lastName, companyName, phone, address]
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
// Update in authController.js
exports.googleCallback = (req, res) => {
  console.log("Google callback user:", req.user);
  
  // Force session save to ensure persistence
  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
      req.flash('error_msg', 'Authentication error. Please try again.');
      return res.redirect('/auth/login');
    }
    
    // New user from OAuth - needs to select role first
    if (req.user && req.user.isNewUser) {
      return res.redirect('/auth/select-role');
    }
    
    // Existing user who needs to complete profile
    if (req.user && req.user.needsProfile) {
      if (req.user.role === 'client') {
        return res.redirect('/auth/complete-profile/client');
      } else if (req.user.role === 'freelancer') {
        return res.redirect('/auth/complete-profile/freelancer');
      }
    }
    
    // Check for freelancer approval status
    if (req.user.role === 'freelancer' && req.user.profile && !req.user.profile.is_approved) {
      return res.redirect('/freelancer/pending');
    }
    
    // Regular authenticated user - redirect based on role
    if (req.user.role === 'client') {
      return res.redirect('/client/dashboard');
    } else if (req.user.role === 'freelancer') {
      return res.redirect('/freelancer/dashboard');
    } else if (req.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    
    return res.redirect('/');
  });
};

// Role selection page for Google OAuth users
// Role selection page for Google OAuth users
exports.getSelectRole = (req, res) => {
  console.log("getSelectRole user:", req.user);
  
  // If user is not authenticated or doesn't need role selection, redirect
  if (!req.user) {
    req.flash('error_msg', 'Please log in to continue.');
    return res.redirect('/auth/login');
  }
  
  // Render the role selection page
  res.render('auth/select-role', { user: req.user });
};

// Process role selection
exports.postSelectRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!req.user) {
      return res.redirect('/auth/login');
    }
    
    // Validate role
    if (role !== 'client' && role !== 'freelancer') {
      req.flash('error_msg', 'Invalid role selected');
      return res.redirect('/auth/select-role');
    }
    
    // For new OAuth users, create them in the database now
    if (req.user.isNewUser) {
      // Create new user with selected role
      const userInsert = await db.query(
        'INSERT INTO users (email, role, google_id) VALUES ($1, $2, $3) RETURNING *',
        [req.user.email, role, req.user.google_id]
      );
      
      const newUser = userInsert.rows[0];
      
      // Update the session to contain the new user ID and remove isNewUser flag
      req.login({
        id: newUser.id,
        email: newUser.email,
        role: role,
        google_id: req.user.google_id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        needsProfile: true
      }, (err) => {
        if (err) {
          console.error('Login error:', err);
          req.flash('error_msg', 'Error updating session. Please try again.');
          return res.redirect('/auth/login');
        }
        
        // Redirect to complete profile based on role
        if (role === 'client') {
          return res.redirect('/auth/complete-profile/client');
        } else {
          return res.redirect('/auth/complete-profile/freelancer');
        }
      });
      return; // Important to return here to prevent the code below from executing
    } 
    
    // For existing users, just update their role
    if (req.user.id) {
      await db.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        [role, req.user.id]
      );
      
      // Update session
      req.user.role = role;
      req.user.needsProfile = true;
      
      // Redirect to complete profile based on role
      if (role === 'client') {
        return res.redirect('/auth/complete-profile/client');
      } else {
        return res.redirect('/auth/complete-profile/freelancer');
      }
    }
  } catch (error) {
    console.error('Role selection error:', error);
    req.flash('error_msg', 'Error updating role. Please try again.');
    return res.redirect('/auth/select-role');
  }
};


// exports.postCompleteClientProfile = async (req, res) => {
//   // Make sure user is authenticated and has an ID
//   if (!req.user || !req.user.id) {
//     return res.redirect('/auth/login');
//   }
  
//   const userId = req.user.id;
//   const { firstName, lastName, companyName, phone, address } = req.body;
//   let skills = req.body.skills ? req.body.skills.split(',').map(skill => skill.trim()) : [];
//   const experience = req.body.experience || '';
//   let cvPath = req.file ? `/uploads/cvs/${req.file.filename}` : '';
  
//   const errors = [];
  
//   // Validate inputs
//   if (!firstName || !lastName) {
//     errors.push({ message: 'Please fill in all required fields' });
//   }
  
//   if (errors.length > 0) {
//     return res.render('auth/complete-profile-client', {
//       errors,
//       user: req.user,
//       firstName,
//       lastName,
//       companyName,
//       phone,
//       address,
//       skills: skills.join(', '),
//       experience
//     });
//   }
  
//   try {
//     const client = await db.getClient();
//     await client.query('BEGIN');
    
//     // Check if client profile already exists
//     const profileCheck = await client.query(
//       'SELECT * FROM clients WHERE user_id = $1',
//       [userId]
//     );
    
//     if (profileCheck.rows.length > 0) {
//       // Update existing profile
//       await client.query(
//         `UPDATE clients 
//          SET first_name = $1, last_name = $2, company_name = $3, 
//              phone = $4, address = $5, skills = $6, 
//              experience = $7, cv_path = CASE WHEN $8 = '' THEN cv_path ELSE $8 END
//          WHERE user_id = $9`,
//         [
//           firstName, 
//           lastName, 
//           companyName, 
//           phone, 
//           address, 
//           skills, 
//           experience, 
//           cvPath, 
//           userId
//         ]
//       );
//     } else {
//       // Insert new client profile
//       await client.query(
//         `INSERT INTO clients 
//          (user_id, first_name, last_name, company_name, phone, address, skills, experience, cv_path) 
//          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
//         [
//           userId, 
//           firstName, 
//           lastName, 
//           companyName, 
//           phone, 
//           address, 
//           skills, 
//           experience, 
//           cvPath
//         ]
//       );
//     }
    
//     // Ensure role is set correctly
//     await client.query(
//       'UPDATE users SET role = $1 WHERE id = $2',
//       ['client', userId]
//     );
    
//     await client.query('COMMIT');
//     client.release();
    
//     // Update session
//     req.user.role = 'client';
//     req.user.needsProfile = false;
    
//     req.flash('success_msg', 'Profile completed successfully');
//     return res.redirect('/client/dashboard');
//   } catch (error) {
//     console.error('Profile completion error:', error);
//     req.flash('error_msg', 'Profile completion failed. Please try again.');
//     res.redirect('/auth/complete-profile/client');
//   }
// };

// Process client profile completion

exports.postCompleteClientProfile = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.redirect('/auth/login');
    }
    
    // Make sure user has an ID (should have been created during role selection)
    if (!req.user.id) {
      req.flash('error_msg', 'User account not properly initialized. Please try again.');
      return res.redirect('/auth/login');
    }
    
    // Get form data
    const { firstName, lastName, companyName, phone, address } = req.body;
    
    // Validate inputs
    const errors = [];
    if (!firstName || !lastName) {
      errors.push({ message: 'Please fill in all required fields' });
    }
    
    if (errors.length > 0) {
      return res.render('auth/complete-profile-client', {
        errors,
        user: req.user,
        firstName: firstName || req.user.first_name || '',
        lastName: lastName || req.user.last_name || '',
        companyName: companyName || '',
        phone: phone || '',
        address: address || ''
      }
      )
    }
    
    // Begin database transaction
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Check if this user already has a client profile
      const existingProfile = await client.query(
        'SELECT * FROM clients WHERE user_id = $1',
        [req.user.id]
      );
      
      if (existingProfile.rows.length > 0) {
        // Update existing profile
        await client.query(
          `UPDATE clients 
           SET first_name = $1, last_name = $2, company_name = $3, 
               phone = $4, address = $5 END,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $9`,
          [
            firstName || req.user.first_name, 
            lastName || req.user.last_name, 
            companyName, 
            phone, 
            address
          ]
        );
      } else {
        // Create new client profile
        await client.query(
          `INSERT INTO clients 
           (user_id, first_name, last_name, company_name, phone, address) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            req.user.id,
            firstName || req.user.first_name, 
            lastName || req.user.last_name, 
            companyName, 
            phone, 
            address
          ]
        );
      }
      
      // Ensure user has the correct role
      await client.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        ['client', req.user.id]
      );
      
      await client.query('COMMIT');
      
      // Update the session to remove needsProfile flag and update role
      req.user.role = 'client';
      req.user.needsProfile = false;
      
      // Load the client profile into the session
      const profileResult = await db.query(
        'SELECT * FROM clients WHERE user_id = $1',
        [req.user.id]
      );
      
      if (profileResult.rows.length > 0) {
        req.user.profile = profileResult.rows[0];
      }
      
      // Success message and redirect
      req.flash('success_msg', 'Profile completed successfully');
      return res.redirect('/client/dashboard');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Profile completion error:', error);
    req.flash('error_msg', 'An error occurred while completing your profile. Please try again.');
    return res.redirect('/auth/complete-profile/client');
  }
};

// // Complete freelancer profile for OAuth users
// exports.getCompleteFreelancerProfile = (req, res) => {
//   if (!req.session.tempUser) {
//     return res.redirect('/auth/login');
//   }
  
//   res.render('auth/complete-profile-freelancer', { user: req.session.tempUser });
// };

// Complete client profile for OAuth users
exports.getCompleteClientProfile = (req, res) => {
  // Check if user is authenticated and needs profile
  if (!req.user || !req.user.id) {
    return res.redirect('/auth/login');
  }
  
  // Render the complete profile form with user data
  res.render('auth/complete-profile-client', { 
    user: req.user,
    firstName: req.user.first_name || '',
    lastName: req.user.last_name || '',
    companyName: '',
    phone: '',
    address: '',
    skills: '',
    experience: ''
  });
};

// Process freelancer profile completion
// Update getCompleteFreelancerProfile in authController.js
exports.getCompleteFreelancerProfile = (req, res) => {
  // Check if user is authenticated and needs profile
  if (!req.user || !req.user.id) {
    return res.redirect('/auth/login');
  }
  
  // Render the complete profile form with user data
  res.render('auth/complete-profile-freelancer', { 
    user: req.user,
    firstName: req.user.first_name || '',
    lastName: req.user.last_name || '',
    phone: '',
    address: '',
    skills: '',
    experience: ''
  });
};

// Add to authController.js if it doesn't exist
exports.postCompleteFreelancerProfile = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.redirect('/auth/login');
    }
    
    // Make sure user has an ID (should have been created during role selection)
    if (!req.user.id) {
      req.flash('error_msg', 'User account not properly initialized. Please try again.');
      return res.redirect('/auth/login');
    }
    
    // Get form data
    const { firstName, lastName, phone, address } = req.body;
    let skills = req.body.skills ? req.body.skills.split(',').map(skill => skill.trim()) : [];
    const experience = req.body.experience || '';
    
    // Get file paths
    let cvPath = req.files && req.files.cv ? `/uploads/cvs/${req.files.cv[0].filename}` : '';
    let clearancePath = req.files && req.files.clearance ? `/uploads/clearances/${req.files.clearance[0].filename}` : '';
    
    // Validate inputs
    const errors = [];
    if (!firstName || !lastName) {
      errors.push({ message: 'Please fill in all required fields' });
    }
    
    if (!req.files || !req.files.clearance || !req.files.cv) {
      errors.push({ message: 'Please upload both a CV and police clearance certificate' });
    }
    
    if (errors.length > 0) {
      return res.render('auth/complete-profile-freelancer', {
        errors,
        user: req.user,
        firstName: firstName || req.user.first_name || '',
        lastName: lastName || req.user.last_name || '',
        phone: phone || '',
        address: address || '',
        skills: skills.join(', ') || '',
        experience: experience || ''
      });
    }
    
    // Begin database transaction
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Check if this user already has a freelancer profile
      const existingProfile = await client.query(
        'SELECT * FROM freelancers WHERE user_id = $1',
        [req.user.id]
      );
      
      if (existingProfile.rows.length > 0) {
        // Update existing profile
        await client.query(
          `UPDATE freelancers 
           SET first_name = $1, last_name = $2, phone = $3, 
               address = $4, skills = $5, experience = $6,
               cv_path = CASE WHEN $7 = '' THEN cv_path ELSE $7 END, 
               clearance_path = CASE WHEN $8 = '' THEN clearance_path ELSE $8 END,
               is_approved = FALSE,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $9`,
          [
            firstName || req.user.first_name, 
            lastName || req.user.last_name, 
            phone, 
            address, 
            skills, 
            experience, 
            cvPath, 
            clearancePath, 
            req.user.id
          ]
        );
      } else {
        // Create new freelancer profile
        await client.query(
          `INSERT INTO freelancers 
           (user_id, first_name, last_name, phone, address, skills, experience, cv_path, clearance_path, is_approved) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            req.user.id,
            firstName || req.user.first_name, 
            lastName || req.user.last_name, 
            phone, 
            address, 
            skills, 
            experience, 
            cvPath, 
            clearancePath, 
            false
          ]
        );
      }
      
      // Ensure user has the correct role
      await client.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        ['freelancer', req.user.id]
      );
      
      await client.query('COMMIT');
      
      req.flash('success_msg', 'Profile completed successfully! Your profile is pending admin approval.');
      return res.redirect('/auth/login');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Profile completion error:', error);
    req.flash('error_msg', 'An error occurred while completing your profile. Please try again.');
    return res.redirect('/auth/complete-profile/freelancer');
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