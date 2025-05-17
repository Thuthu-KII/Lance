const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./database');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      const existingUser = await db.query(
        'SELECT * FROM users WHERE google_id = $1',
        [profile.id]
      );

      if (existingUser.rows.length > 0) {
        return done(null, existingUser.rows[0]);
      }

      // Create new user
      const role = req.query.state || 'freelancer';
      const newUser = {
        google_id: profile.id,
        email: profile.emails[0].value,
        display_name: profile.displayName,
        role: role
      };

      const result = await db.query(
        `INSERT INTO users (google_id, email, display_name, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [newUser.google_id, newUser.email, newUser.display_name, newUser.role]
      );

      done(null, result.rows[0]);
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query(
      'SELECT id, email, display_name, role, is_admin FROM users WHERE id = $1',
      [id]
    );
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;