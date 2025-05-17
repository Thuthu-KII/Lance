const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { isAuthenticated, isClient, isAdmin } = require('../middleware/auth');

// Client payment for job
router.get('/job/:id', isAuthenticated, isClient, paymentController.getJobPaymentPage);
router.post('/job/:id', isAuthenticated, isClient, paymentController.postJobPayment);

module.exports = router;