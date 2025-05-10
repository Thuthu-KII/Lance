const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/removeClient',adminController.removeClient);
router.post('/removeLancer',adminController.removeLancer);

module.exports = router;
