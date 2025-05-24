const express = require('express');
const router = express.Router();
const freelancerController = require('../controllers/freelancerController');
const jobController = require('../controllers/jobController');
const { isAuthenticated, isFreelancer, isApprovedFreelancer, checkFreelancerProfile } = require('../middleware/auth');
const { upload } = require('../middleware/fileUpload');

router.get('/dashboard', isAuthenticated, isFreelancer, checkFreelancerProfile, freelancerController.getDashboard);
router.get('/profile', isAuthenticated, isFreelancer, checkFreelancerProfile, freelancerController.getProfile);
// In your routes file
router.get('/complete-profile', isAuthenticated, freelancerController.getCompleteProfile);
router.post('/complete-profile', isAuthenticated, freelancerController.postCompleteProfile);
// Apply authentication middleware to all routes
router.use(isAuthenticated, isFreelancer);

// // In your routes file
// router.get('/complete-profile', isAuthenticated, freelancerController.getCompleteProfile);
// router.post('/complete-profile', isAuthenticated, freelancerController.postCompleteProfile);

// Pending approval page (accessible even without approval)
router.get('/pending', freelancerController.getPendingPage);

// Apply approved freelancer middleware to all other routes
router.use(isApprovedFreelancer);

// Dashboard
// router.get('/dashboard', freelancerController.getDashboard);

// Applications
router.get('/applications', freelancerController.getApplications);

// Active jobs
router.get('/jobs', freelancerController.getActiveJobs);
router.get('/jobs/:id', freelancerController.getJobDetails);
router.post('/jobs/:id/complete', jobController.postFreelancerCompleteJob);

// Report issue
router.post('/jobs/:id/report', freelancerController.reportJobIssue);

module.exports = router;