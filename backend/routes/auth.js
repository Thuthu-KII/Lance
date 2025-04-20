const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
require('dotenv').config();



let userName="";
//console.log(process.env.GOOGLE_CLIENT_ID);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/google/callback" // when we enter google/auth redirect them using this url
  },
  // someone succesfully logs in
  async function(accessToken, refreshToken, profile/* this profile is the one you tap when you sign in, has all profile info */, cb) {
    try {
        const { addUser, findUserByGoogleId } = require('./index.js'); // Import here to break circular dependency // import index

        let user = findUserByGoogleId.get(profile.id);

        if (!user) {
            const newUser = {
                googleId: profile.id,
                email: profile.emails[0].value,
                displayName: profile.displayName
            };
            addUser.run(newUser);
            user = findUserByGoogleId.get(profile.id);
            userName= profile.displayName
        }

        cb(null, user);
    } catch (error) {
        cb(error);
    }
}

));
function username(){
    return userName;
}

passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });
  
  passport.deserializeUser(async (id, cb) => {
    try {
        const {findUserById} = require("./index.js")
      const user = findUserById.get(id);
      cb(null, user);
    } catch (err) {
      cb(err);
    }
  });

  module.exports={
    username
  }