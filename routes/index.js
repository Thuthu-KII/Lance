/**
 * Main router that combines all route modules
 */
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const clientRoutes = require('./clientRoutes');
const freelancerRoutes = require('./freelancerRoutes');
const adminRoutes = require('./adminRoutes');
const jobRoutes = require('./jobRoutes');
const paymentRoutes = require('./paymentRoutes');
const profileRoutes = require('./profileRoutes');
const { notFound } = require('../utils/errorHandler');

// Set up routes
router.use('/auth', authRoutes);
router.use('/client', clientRoutes);
router.use('/freelancer', freelancerRoutes);
router.use('/admin', adminRoutes);
router.use('/jobs', jobRoutes);
router.use('/payments', paymentRoutes);
router.use('/profile', profileRoutes);

// Home route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'lance - Connect with Clients and Freelancers',
    user: req.user
  });
});

// Handle 404 routes
router.use(notFound);

module.exports = router;