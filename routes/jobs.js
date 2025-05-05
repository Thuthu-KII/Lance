const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobConttroller');

router.get('/', jobController.showAvailableJobs);
router.post('/', jobController.addJob);
router.post('/updateStatus',jobController.updateStatus);
router.post('/countApp',jobController.countApplications);
router.post('/addApp',jobController.addApplication);

module.exports = router;
