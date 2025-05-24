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
    console.log("Google OAuth Strategy - Starting authentication for:", profile.emails[0].value);
    const userResult = await db.query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2',
      [profile.id, profile.emails[0].value]
    );

    if (userResult.rows.length > 0) {
      // User exists
      const user = userResult.rows[0];
      
      // Update Google ID if necessary
      if (!user.google_id) {
        await db.query(
          'UPDATE users SET google_id = $1 WHERE id = $2',
          [profile.id, user.id]
        );
      }
      
      // Check if user has a profile
      let hasProfile = false;
      
      if (user.role === 'client') {
        const clientResult = await db.query('SELECT * FROM clients WHERE user_id = $1', [user.id]);
        hasProfile = clientResult.rows.length > 0;
      } else if (user.role === 'freelancer') {
        const freelancerResult = await db.query('SELECT * FROM freelancers WHERE user_id = $1', [user.id]);
        hasProfile = freelancerResult.rows.length > 0;
      }
      
      if (hasProfile) {
        // Complete user with profile - proceed with login
        return done(null, user);
      } else {
        // User exists but needs to complete profile
        return done(null, {
          id: user.id,
          email: user.email,
          role: user.role,
          google_id: profile.id,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          needsProfile: true
        });
      }
    }

    // New user - DON'T create in database yet, use temporary object
    const tempUser = {
      email: profile.emails[0].value,
      google_id: profile.id,
      first_name: profile.name.givenName,
      last_name: profile.name.familyName,
      isNewUser: true  // Flag to indicate this is a new user
    };
    
    return done(null, tempUser);
  } catch (error) {
    console.error("Google OAuth Strategy Error:", error);
    return done(error);
  }
}));

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user);
  
  // For temporary users (like from OAuth)
  if (user.isNewUser) {
    console.log("Serializing new OAuth user");
    return done(null, { type: 'new', data: user });
  }
  
  // For users who need to complete profile
  if (user.needsProfile) {
    console.log("Serializing user who needs profile");
    return done(null, { type: 'incomplete', id: user.id, role: user.role });
  }
  
  // For regular users with ID
  if (user.id) {
    console.log("Serializing regular user with ID:", user.id);
    return done(null, { type: 'regular', id: user.id });
  }
  
  return done(new Error('Cannot serialize user without proper data'));
});

passport.deserializeUser(async (serialized, done) => {
  console.log("Deserializing:", serialized);
  
  try {
    if (!serialized) {
      return done(null, false);
    }
    
    // Handle different types of serialized data
    if (serialized.type === 'new') {
      console.log("Deserializing new OAuth user");
      return done(null, serialized.data);
    }
    
    if (serialized.type === 'incomplete') {
      console.log("Deserializing user who needs profile");
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [serialized.id]);
      if (userResult.rows.length === 0) {
        return done(null, false);
      }
      
      const user = userResult.rows[0];
      user.needsProfile = true;
      return done(null, user);
    }
    
    if (serialized.type === 'regular') {
      console.log("Deserializing regular user");
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [serialized.id]);
      
      if (userResult.rows.length === 0) {
        return done(null, false);
      }
      
      const user = userResult.rows[0];
      let profile = null;
      
      // Get role-specific data
      if (user.role === 'client') {
        const profileResult = await db.query('SELECT * FROM clients WHERE user_id = $1', [serialized.id]);
        if (profileResult.rows.length > 0) {
          profile = profileResult.rows[0];
        }
      } else if (user.role === 'freelancer') {
        const profileResult = await db.query('SELECT * FROM freelancers WHERE user_id = $1', [serialized.id]);
        if (profileResult.rows.length > 0) {
          profile = profileResult.rows[0];
        }
      } else if (user.role === 'admin') {
        const profileResult = await db.query('SELECT * FROM admins WHERE user_id = $1', [serialized.id]);
        if (profileResult.rows.length > 0) {
          profile = profileResult.rows[0];
        }
      }
      
      // Combine user and profile data
      return done(null, { ...user, profile });
    }
    
    // Fallback for legacy serialized data (just an ID)
    if (typeof serialized === 'number' || typeof serialized === 'string') {
      console.log("Deserializing legacy format with just ID");
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [serialized]);
      
      if (userResult.rows.length === 0) {
        return done(null, false);
      }
      
      const user = userResult.rows[0];
      let profile = null;
      
      // Get role-specific data
      if (user.role === 'client') {
        const profileResult = await db.query('SELECT * FROM clients WHERE user_id = $1', [serialized]);
        if (profileResult.rows.length > 0) {
          profile = profileResult.rows[0];
        }
      } else if (user.role === 'freelancer') {
        const profileResult = await db.query('SELECT * FROM freelancers WHERE user_id = $1', [serialized]);
        if (profileResult.rows.length > 0) {
          profile = profileResult.rows[0];
        }
      } else if (user.role === 'admin') {
        const profileResult = await db.query('SELECT * FROM admins WHERE user_id = $1', [serialized]);
        if (profileResult.rows.length > 0) {
          profile = profileResult.rows[0];
        }
      }
      
      // Combine user and profile data
      return done(null, { ...user, profile });
    }
    
    return done(null, false);
  } catch (error) {
    console.error("Deserialization detailed error:", error.message);
    console.error("Deserialization error:", error);
    done(error);
  }
});

module.exports = passport;