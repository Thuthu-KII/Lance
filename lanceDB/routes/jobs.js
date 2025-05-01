const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobConttroller');

router.get('/', jobController.showAvailableJobs);
router.post('/', jobController.addJob);
router.post('/updateStatus',jobController.updateStatus);

module.exports = router;
