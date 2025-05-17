const express = require('express');
const router = express.Router();
const freelancerController = require('../controllers/freelancerController');
const jobController = require('../controllers/jobController');
const { isAuthenticated, isFreelancer, isApprovedFreelancer } = require('../middleware/auth');
const { upload } = require('../middleware/fileUpload');

// Apply authentication middleware to all routes
router.use(isAuthenticated, isFreelancer);

// Pending approval page (accessible even without approval)
router.get('/pending', freelancerController.getPendingPage);

// Apply approved freelancer middleware to all other routes
router.use(isApprovedFreelancer);

// Dashboard
router.get('/dashboard', freelancerController.getDashboard);

// Applications
router.get('/applications', freelancerController.getApplications);

// Active jobs
router.get('/jobs', freelancerController.getActiveJobs);
router.get('/jobs/:id', freelancerController.getJobDetails);
router.post('/jobs/:id/complete', jobController.postFreelancerCompleteJob);

// Report issue
router.post('/jobs/:id/report', freelancerController.reportJobIssue);

module.exports = router;