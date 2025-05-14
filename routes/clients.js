const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.post('/addClient', clientController.addClient);
router.get('/profile',clientController.getProfile);
//router.post('/updateDetails',clientController.updateProfile);

module.exports = router;
