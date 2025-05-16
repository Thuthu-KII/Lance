const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../controllers/authController');
const { generate } = require('../controllers/invoiceController');

router.get('/', ensureAuthenticated, generate);

module.exports = router;
