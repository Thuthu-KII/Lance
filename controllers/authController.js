const db = require('../config/database');
const passport = require('passport');
const { generateToken } = require('../services/authService');

module.exports = {
  login: (req, res, next) => {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: req.query.role
    })(req, res, next);
  },

  callback: (req, res, next) => {
    passport.authenticate('google', {
      failureRedirect: '/auth/failure',
      successRedirect: '/dashboard',
      session: true
    })(req, res, next);
  },

  logout: (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid')
          .status(200)
          .json({ message: 'Logged out successfully' });
      });
    });
  },

  failure: (req, res) => {
    res.status(401).render('auth/failure', { error: 'Authentication failed' });
  },

  getCurrentUser: async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const user = await db.query(
        'SELECT id, email, display_name, role, is_admin, verified FROM users WHERE id = $1',
        [req.user.id]
      );
      res.json(user.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
};