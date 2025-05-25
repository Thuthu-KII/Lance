const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { upload } = require('../middleware/fileUpload');

// Helper to check if handler exists
const ensureHandler = (handler, name) => {
  if (!handler) {
    console.error(`Handler ${name} is undefined!`);
    return (req, res) => res.status(500).send(`Error: Route handler '${name}' is not implemented yet.`);
  }
  return handler;
};

// Login page
router.get('/login', ensureHandler(authController.getLogin, 'getLogin'));
router.post('/login', ensureHandler(authController.postLogin, 'postLogin'));

// Register pages
router.get('/register', ensureHandler(authController.getRegister, 'getRegister'));
router.get('/register/client', ensureHandler(authController.getRegisterClient, 'getRegisterClient'));
router.get('/register/freelancer', ensureHandler(authController.getRegisterFreelancer, 'getRegisterFreelancer'));

// Process registrations
router.post('/register/client', upload.single('cv'), 
  ensureHandler(authController.postRegisterClient, 'postRegisterClient'));
router.post('/register/freelancer', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'clearance', maxCount: 1 }
]), ensureHandler(authController.postRegisterFreelancer, 'postRegisterFreelancer'));

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  ensureHandler(authController.googleCallback, 'googleCallback')
);

// Role selection for Google auth users
router.get('/select-role', ensureHandler(authController.getSelectRole, 'getSelectRole'));
router.post('/select-role', ensureHandler(authController.postSelectRole, 'postSelectRole'));

// Complete profile routes for OAuth users
router.get('/complete-profile/client', 
  ensureHandler(authController.getCompleteClientProfile, 'getCompleteClientProfile'));
router.post('/complete-profile/client', upload.single('cv'), 
  ensureHandler(authController.postCompleteClientProfile, 'postCompleteClientProfile'));

router.get('/complete-profile/freelancer', 
  ensureHandler(authController.getCompleteFreelancerProfile, 'getCompleteFreelancerProfile'));
router.post('/complete-profile/freelancer', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'clearance', maxCount: 1 }
]), ensureHandler(authController.postCompleteFreelancerProfile, 'postCompleteFreelancerProfile'));

// Logout
router.get('/logout', ensureHandler(authController.logout, 'logout'));

module.exports = router;