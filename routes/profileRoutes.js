const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');
const { upload } = require('../middleware/fileUpload');

// Apply middleware to all routes
router.use(isAuthenticated);

// View profile
router.get('/', profileController.getProfile);

// Update profiles based on role
router.put('/client', upload.single('cv'), profileController.updateClientProfile);
router.put('/freelancer', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'clearance', maxCount: 1 }
]), profileController.updateFreelancerProfile);
router.put('/admin', profileController.updateAdminProfile);

// Change password
router.post('/change-password', profileController.changePassword);

module.exports = router;