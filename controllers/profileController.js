/**
 * Controller for user profile management
 */
const User = require('../models/User');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { AppError } = require('../utils/errorHandler');

// Get profile page
exports.getProfile = async (req, res, next) => {
  try {
    if (req.user.role === 'client') {
      res.render('profile/client-profile', {
        user: req.user
      });
    } else if (req.user.role === 'freelancer') {
      res.render('profile/freelancer-profile', {
        user: req.user
      });
    } else if (req.user.role === 'admin') {
      res.render('profile/admin-profile', {
        user: req.user
      });
    } else {
      return next(new AppError('Invalid user role', 400));
    }
  } catch (error) {
    next(error);
  }
};

// Update client profile
exports.updateClientProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, companyName, phone, address, skills, experience } = req.body;
    const userId = req.user.id;
    const clientId = req.user.profile.id;
    
    // Process skills into array
    let skillsArray = skills ? skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '') : [];
    
    // Get CV path from file upload or use existing
    let cvPath = req.user.profile.cv_path;
    if (req.file) {
      cvPath = `/uploads/cvs/${req.file.filename}`;
    }
    
    // Update profile
    await Client.update(clientId, {
      firstName,
      lastName,
      companyName,
      phone,
      address,
      skills: skillsArray,
      experience,
      cvPath
    });
    
    req.flash('success_msg', 'Profile updated successfully');
    res.redirect('/profile');
  } catch (error) {
    next(error);
  }
};

// Update freelancer profile
exports.updateFreelancerProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address, skills, experience } = req.body;
    const userId = req.user.id;
    const freelancerId = req.user.profile.id;
    
    // Process skills into array
    let skillsArray = skills ? skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '') : [];
    
    // Get file paths from uploads or use existing
    let cvPath = req.user.profile.cv_path;
    let clearancePath = req.user.profile.clearance_path;
    
    if (req.files) {
      if (req.files.cv && req.files.cv.length > 0) {
        cvPath = `/uploads/cvs/${req.files.cv[0].filename}`;
      }
      
      if (req.files.clearance && req.files.clearance.length > 0) {
        clearancePath = `/uploads/clearances/${req.files.clearance[0].filename}`;
      }
    }
    
    // Update profile
    await Freelancer.update(freelancerId, {
      firstName,
      lastName,
      phone,
      address,
      skills: skillsArray,
      experience,
      cvPath,
      clearancePath
    });
    
    req.flash('success_msg', 'Profile updated successfully');
    res.redirect('/profile');
  } catch (error) {
    next(error);
  }
};

// Update admin profile
exports.updateAdminProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;
    const adminId = req.user.profile.id;
    
    // Update profile
    await Admin.update(adminId, {
      firstName,
      lastName
    });
    
    req.flash('success_msg', 'Profile updated successfully');
    res.redirect('/profile');
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      req.flash('error_msg', 'Please fill in all password fields');
      return res.redirect('/profile');
    }
    
    if (newPassword.length < 6) {
      req.flash('error_msg', 'New password must be at least 6 characters');
      return res.redirect('/profile');
    }
    
    if (newPassword !== confirmPassword) {
      req.flash('error_msg', 'New passwords do not match');
      return res.redirect('/profile');
    }
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/profile');
    }
    
    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      req.flash('error_msg', 'Current password is incorrect');
      return res.redirect('/profile');
    }
    
    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await User.update(userId, {
      password: hashedPassword
    });
    
    req.flash('success_msg', 'Password changed successfully');
    res.redirect('/profile');
  } catch (error) {
    next(error);
  }
};