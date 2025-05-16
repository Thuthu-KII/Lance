const express = require('express');
const router = express.Router();
const passport = require('../config/passport').passport;

router.get('/signup', (req,res)=> res.render('signup'));

router.get('/auth/google', (req, res, next) => {
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    state: req.query.role
  })(req, res, next);
});

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`/${req.user.role.toLowerCase()}/dashboard`);
  }
);

router.get('/login', (req,res) => res.render('login'));
router.get('/logout', (req,res) => {
  req.logout(err => {
    req.session.destroy(() => res.redirect('/'));
  });
});

module.exports = router;
