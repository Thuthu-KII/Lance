const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

router.post('/countApplications', applicationController.countApplications);

module.exports = router;
