const express = require('express');
const router = express.Router();
const { passport } = require('../config/passport');

const { isLogged } = require('../controllers/authController');

// Google OAuth Routes
router.get("/auth/google", passport.authenticate('google', { scope: ["email", "profile"] }));
router.get("/google/callback", passport.authenticate('google', { failureRedirect: 'auth/failure', successRedirect: "/signed" }));
router.get('/signed', isLogged, (req, res) => res.render("client", { user: req.user }));
router.get('/auth/failure', (req, res) => res.render("homepage", { error: ["failed to authenticate email"] }));
router.get('/logout', (req, res) => req.logout(err => { 
    if (err) return res.status(500).send("Logout failed");
    req.session.destroy(err => { if (err) return next(err); res.clearCookie('connect.sid').redirect('/'); }); 
}));

module.exports = router;
