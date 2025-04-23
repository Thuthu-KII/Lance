const express = require('express');
const router = express.Router();
const lancerController = require('../controllers/lancerController');

router.post('/', lancerController.addLancer);

module.exports = router;
