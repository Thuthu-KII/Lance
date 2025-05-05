const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.post('/', clientController.addClient);
router.post('/profile',clientController.getProfile);
router.post('/updateDetails',clientController.updateProfile);

module.exports = router;
