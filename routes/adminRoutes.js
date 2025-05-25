const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const jobController = require('../controllers/jobController');
const paymentController = require('../controllers/paymentController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Apply middleware to all routes
router.use(isAuthenticated, isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/add-admin', adminController.addAdminUser);

// Freelancer approvals
router.get('/approvals', adminController.getPendingApprovals);
router.post('/freelancers/:id/approve', adminController.approveFreelancer);
router.post('/freelancers/:id/reject', adminController.rejectFreelancer);

// Reports
router.get('/reports', adminController.getReports);
router.get('/reports/:id', adminController.getReportDetails);
router.post('/reports/:id/process', adminController.processReport);

// Jobs
router.get('/jobs', jobController.adminGetAllJobs);
router.get('/jobs/:id', jobController.adminGetJobDetails);
router.delete('/jobs/:id', jobController.adminDeleteJob);

// Payments
router.get('/payments', paymentController.adminGetAllPayments);
router.post('/payments/:paymentId/process', paymentController.adminProcessFreelancerPayment);

// System stats
router.get('/stats', adminController.getSystemStats);

module.exports = router;