const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const db = require('./database');
require('dotenv').config();

// Local Strategy (email/password)
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      // Find user by email
      const userResult = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const user = userResult.rows[0];

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Check if freelancer is approved
      if (user.role === 'freelancer') {
        const freelancerResult = await db.query(
          'SELECT is_approved FROM freelancers WHERE user_id = $1',
          [user.id]
        );

        if (freelancerResult.rows.length > 0 && !freelancerResult.rows[0].is_approved) {
          return done(null, false, { message: 'Your account is pending approval by an administrator' });
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    const userResult = await db.query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2',
      [profile.id, profile.emails[0].value]
    );

    if (userResult.rows.length > 0) {
      // User exists, update Google ID if necessary
      if (!userResult.rows[0].google_id) {
        await db.query(
          'UPDATE users SET google_id = $1 WHERE id = $2',
          [profile.id, userResult.rows[0].id]
        );
      }
      return done(null, userResult.rows[0]);
    }

    // Redirect to role selection for new users
    // We'll handle the actual creation in the auth controller
    const insertResult = await db.query(
  `INSERT INTO users (google_id, email, role)
   VALUES ($1, $2, $3)
   RETURNING *`,
  [profile.id, profile.emails[0].value, 'client'] // default role can be changed
);

const newUser = insertResult.rows[0];

// Optionally, insert into clients table
await db.query(`INSERT INTO clients (user_id,first_name,last_name) VALUES ($1)`, [profile.id, profile.name.givenName, profile.name.familyName, 'client']);

return done(null, newUser);

  } catch (error) {
    return done(error);
  }
}));

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
   if (!user.id) {
    return done(new Error('Cannot serialize user without id'));
  }
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userResult.rows.length === 0) {
      return done(null, false);
    }
    
    const user = userResult.rows[0];
    let profile = null;
    
    // Get role-specific data
    if (user.role === 'client') {
      const profileResult = await db.query('SELECT * FROM clients WHERE user_id = $1', [id]);
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    } else if (user.role === 'freelancer') {
      const profileResult = await db.query('SELECT * FROM freelancers WHERE user_id = $1', [id]);
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    } else if (user.role === 'admin') {
      const profileResult = await db.query('SELECT * FROM admins WHERE user_id = $1', [id]);
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    }
    
    // Combine user and profile data
    done(null, { ...user, profile });
  } catch (error) {
    done(error);
  }
});

module.exports = passport;