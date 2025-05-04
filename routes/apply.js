const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

router.post('/countApplications', applicationController.countApplications);
router.post('/sendApplication',applicationController.addApplication);

module.exports = router;
