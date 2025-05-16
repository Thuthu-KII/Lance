const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { User } = require('../models');

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const [user] = await User.findOrCreate({
        where: { googleId: profile.id, role: req.query.state },
        defaults: {
          displayName: profile.displayName,
          email: profile.emails[0].value,
          role: req.query.state
        }
      });
      return done(null, user);
    } catch (err) {
      done(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = { passport };
