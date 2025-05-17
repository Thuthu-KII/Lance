const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/adminMiddleware');

// Admin dashboard
router.get('/dashboard', isAdmin, adminController.getDashboard);

// User management
router.post('/users/:id/verify', isAdmin, adminController.verifyFreelancer);
router.post('/users/:id/suspend', isAdmin, adminController.suspendUser);

// Job management
router.post('/jobs/:id/approve', isAdmin, adminController.approveJob);
router.delete('/jobs/:id', isAdmin, adminController.deleteJob);

// Report management
router.post('/reports/:id/resolve', isAdmin, adminController.resolveReport);

module.exports = router;