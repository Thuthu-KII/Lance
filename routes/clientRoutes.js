const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const jobController = require('../controllers/jobController');
const { isAuthenticated, isClient } = require('../middleware/auth');
const { upload } = require('../middleware/fileUpload');

// Apply middleware to all routes
router.use(isAuthenticated, isClient);

// Dashboard
router.get('/dashboard', clientController.getDashboard);

// Jobs management
router.get('/jobs', clientController.getJobs);
router.get('/jobs/:id', clientController.getJobDetails);
router.get('/jobs/:id/applications', jobController.getJobApplications);
router.post('/jobs/:jobId/applications/:applicationId/hire', jobController.postHireFreelancer);
router.post('/jobs/:id/complete', jobController.postCompleteJob);

// Report issue
router.post('/jobs/:id/report', clientController.reportJobIssue);

// Job creation/editing routes are in jobRoutes.js

module.exports = router;