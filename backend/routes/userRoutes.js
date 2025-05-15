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
// posting job function listens to client.ejs
router.post('/post-job', userController.postJob);

router.get("/applications", (req,res)=>{
    res.render("clientdash",{ user1: req.user[0], user2:req.user[1] });
});
router.get('/lancers', async (req, res) => {
    const { googleId } = req.query;
    if (!googleId) return res.status(400).json({ error: 'Missing googleId' });

    try {
        const result = await pool.query('SELECT * FROM lncrs WHERE googleId = $1', [googleId]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]); // User exists
        } else {
            res.status(404).json({ error: 'Lancer not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});
module.exports = router;
