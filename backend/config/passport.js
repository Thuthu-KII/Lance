const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
//require('dotenv').config();

const path = require('path');
//const { addClient } = require('../models/clientModel.js');
const { addLancer, addClient, getLancerByGoogleId, getClientByGoogleId } = require('../api/userApi');
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
    callbackURL: "http://localhost:3000/auth/google/callback", // when we enter google/auth redirect them using this url
    passReqToCallback: true
  },
  // someone succesfully logs in
  async (req, accessToken, refreshToken, profile, done) => {
   // console.log("Google Profile:", profile); //for google information 109238854959249109365
    const role = req.query.state;
    //console.log("📌 Google Profile Display Name:", profile.displayName);
    const userInfo = {
        lancerId: profile.id,
        googleId: profile.id,
        userName: profile.displayName,
        email: profile.emails[0].value,
        role: role
    };

    try {
        let existingUser = null;

        if (role === "Client") {
            existingUser = await getClientByGoogleId(profile.id);
            if (!existingUser) await addClient(userInfo);
        } else if (role === "Freelancer") {
            existingUser = await getLancerByGoogleId(profile.id);
            if (existingUser) {
                existingUser.role = "Freelancer";
                existingUser.userName = existingUser.userName || profile.displayName;
            }            if (!existingUser) await addLancer(userInfo);
        } else {
            return done(new Error('Invalid role received during authentication'), null);
        }

        return done(null, existingUser || userInfo);
    } catch (err) {
        return done(err, null);
    }
}

));
const Username = userName;

passport.serializeUser((user, done) => {    
    if (user.lancerId) {
        done(null, { id: user.lancerId, role: 'Freelancer' });
    } else if (user.clientId) {
        done(null, { id: user.clientId, role: 'Client' });
    } else {
        done(new Error("Unable to determine user role during serialization."));
    }
});
  
passport.deserializeUser(async (sessionData, done) => {
    try {
        const { id, role } = sessionData;

        let user = null;
        if (role === 'Freelancer') {
            user = await getLancerByGoogleId(id);
        } else if (role === 'Client') {
            user = await getClientByGoogleId(id);
        }

        if (!user) {
            return done(new Error("User not found during deserialization."));
        }
        user.role = role;
        if (!user.userName) {
            user.userName = 'User'; // Fallback if no username is found
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

  module.exports = {
    Username,
    passport
  };
  
