const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../controllers/authController');
const { postJob, listAll } = require('../controllers/jobController');

router.post('/', ensureAuthenticated, postJob);
router.get('/', listAll);

module.exports = router;
