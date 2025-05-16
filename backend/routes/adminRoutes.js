const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../controllers/authController');
const { dashboard, activateFreelancer } = require('../controllers/adminController');

router.get('/dashboard', ensureAuthenticated, dashboard);
router.post('/activate/:id', ensureAuthenticated, activateFreelancer);

module.exports = router;
