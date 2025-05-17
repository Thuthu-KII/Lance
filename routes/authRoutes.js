const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { upload } = require('../middleware/fileUpload');

// Login page
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Register pages
router.get('/register', authController.getRegister);
router.get('/register/client', authController.getRegisterClient);
router.get('/register/freelancer', authController.getRegisterFreelancer);

// Process registrations
router.post('/register/client', upload.single('cv'), authController.postRegisterClient);
router.post('/register/freelancer', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'clearance', maxCount: 1 }
]), authController.postRegisterFreelancer);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  authController.googleCallback
);

// Role selection for Google auth users
router.get('/select-role', authController.getSelectRole);
router.post('/select-role', authController.postSelectRole);

// Complete profile routes for OAuth users
router.get('/complete-profile/client', authController.getCompleteClientProfile);
router.post('/complete-profile/client', upload.single('cv'), authController.postCompleteClientProfile);

router.get('/complete-profile/freelancer', authController.getCompleteFreelancerProfile);
router.post('/complete-profile/freelancer', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'clearance', maxCount: 1 }
]), authController.postCompleteFreelancerProfile);

// Logout
router.get('/logout', authController.logout);

module.exports = router;