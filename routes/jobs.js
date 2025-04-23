const express = require('express');
const router = express.Router();
const jobController = require('../lanceDB/controllers/jobController');

router.get('/', jobController.showAvailableJobs);
router.post('/', jobController.addJob);

module.exports = router;
