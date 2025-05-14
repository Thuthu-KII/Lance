const express = require('express');
const router = express.Router();
const lancerController = require('../controllers/lancerController');

router.post('/', lancerController.addLancer);
router.post('/updateDetails',lancerController.updateProfile);
router.get('/getLancerByGoogleId', lancerController.getLancerByGoogleId);

module.exports = router;
