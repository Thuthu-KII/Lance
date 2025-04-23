const express = require('express');
const router = express.Router();
const { passport } = require('../config/passport');

const { isLogged } = require('../controllers/authController');

// Google OAuth Routes
router.get("/auth/google", passport.authenticate('google', { scope: ["email", "profile"] }));
router.get("/google/callback", passport.authenticate('google', { failureRedirect: 'auth/failure', }),
    async (req, res) => {
        if (!req.user.user_type) {
        return res.redirect("/select-role");
        }
        res.redirect(`/dashboard/${req.user.user_type}`);
    }
);
// would have to revamp this later, its just links
router.get("/select-role", (req, res) => {
    res.send(`<h2>Select your role:</h2>
      <a href="/set-role/freelancer">Freelancer</a> | 
      <a href="/set-role/client">Client</a>`);
  });

  router.get("/set-role/:role", async (req, res) => {
    if (!req.user) return res.redirect("/");
    
    // saving usertype in sqlite
    const { updateUserRole } = require('../models/userModel');
    updateUserRole.run(req.params.role, req.user.googleId);
    req.user.user_type = req.params.role;
    
    res.redirect(`/dashboard/${req.user.user_type}`);
  });
// // this should be in pages route
// router.get("/dashboard/client", (req, res) => {
//   res.render("Client", { user: req.user });
// });
// router.get("/dashboard/freelancer", (req, res) => res.render("freelancer_dashboard"));

router.get('/signed', isLogged, (req, res) => res.render("client", { user: req.user }));
router.get('/auth/failure', (req, res) => res.render("homepage", { error: ["failed to authenticate email"] }));
router.get('/logout', (req, res) => req.logout(err => { 
    if (err) return res.status(500).send("Logout failed");
    req.session.destroy(err => { if (err) return next(err); res.clearCookie('connect.sid').redirect('/'); }); 
}));

module.exports = router;
