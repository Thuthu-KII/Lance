const express = require('express');
const router = express.Router();
const lancerController = require('../controllers/lancerController');

router.post('/', lancerController.addLancer);
router.post('/profile',lancerController.getProfile);

module.exports = router;
