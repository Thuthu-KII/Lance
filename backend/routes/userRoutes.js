// handles user-related logic in our express apppp

const express = require('express');
const router = express.Router();
const { addUser, findUserByEmail } = require('../models/userModel');
const {addJob} = require('../models/jobModel');
const userController = require('../controllers/userController');

// Example route for adding a user
router.post('/register', (req, res) => {
    const { email, displayName, googleId } = req.body;
    addUser.run({ googleId, email, displayName });
    res.redirect('/login');
});

router.post('/post-job', userController.postJob);


module.exports = router;
