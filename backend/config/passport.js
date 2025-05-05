const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
//require('dotenv').config();

const path = require('path');
//const { addClient } = require('../models/clientModel.js');

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({
  path: path.resolve(__dirname, '..', envFile)
});  

let userName="";
let role="";

//
//console.log(process.env.GOOGLE_CLIENT_ID):
let the_user;
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://lance-gx1d.onrender.com/google/callback", // when we enter google/auth redirect them using this url
    passReqToCallback: true
  },
  // someone succesfully logs in
  async function(req,accessToken, refreshToken, profile/* this profile is the one you tap when you sign in, has all profile info */, cb) {
     role= req.query.state;
    try {
        const { addUser, findUserByGoogleId } = require('../models/userModel.js'); // Import here to break circular dependency // import index
        //const {addClient, getProfile} = require('../models/clientModel.js');
        
        the_user = {
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value
        };
        let user = findUserByGoogleId.get(profile.id,role);

        if (!user) {
            const newUser = {
                googleId: profile.id,
                role:req.query.state
              //  email: profile.emails[0].value,
              //  displayName: profile.displayName
            };
            addUser.run(newUser); // added our new user 
            user = findUserByGoogleId.get(profile.id,role);  // return a google id&role only
          }
       // console.log(the_user);
        cb(null, the_user); 
    } catch (error) {
        cb(error);
    }
}

));
const Username = userName;

passport.serializeUser((user, cb) => {
    cb(null, user.googleId);
  });
  
  passport.deserializeUser(async (id, cb) => {
    const { findUserByGoogleId } = require("../models/userModel");
    // /console.log(role, "   ", id);

    const user = findUserByGoogleId.get(id,role); // this must not be undefined if undefined the user doe
//    console.log(user);
    if (!user)  return cb(null, { message: "User already has an account", user });
    cb(null, [the_user,user,role]);
  });

  module.exports = {
    Username,
    passport
  };
  
