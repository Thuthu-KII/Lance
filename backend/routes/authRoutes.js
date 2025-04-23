const express = require('express');
const router = express.Router();
const { passport, Username } = require('../config/passport'); // as a actual ""function


const { isLogged } = require('../controllers/authController');
//Intermediary
let Role="";
router.get('/Client', (req,res)=>{
    Role = "Client";
   // console.log(Role+"Dd");
    res.render("signup", {Role});
   
});
router.get('/Freelancer', (req,res)=>{
    Role = "Freelancer";
    res.render("signup", {Role});
    //Role='';
});

// Google OAuth Routes
router.get("/auth/google",(req, res, next) => {
   
    
    passport.authenticate('google', {
         scope: ["email", "profile"],
        state: Role
        })(req,res,next)
     
});


router.get("/google/callback",(req,res,next)=>{

const role = req.query.state;

 passport.authenticate('google', 
    { failureRedirect: 'auth/failure',
     successRedirect: "/"+role+"-in" })(req,res,next)


} );

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { 
      return next(); 
    }
    res.redirect('/auth/failure'); // or login page
  }
  

router.get('/Client-in', isLogged,ensureAuthenticated, (req, res) => res.render("clientdash", { user1: req.user[0], user2:req.user[1] }));

router.get('/Freelancer-in', isLogged,ensureAuthenticated, (req, res) => res.render("freelancer_dashboard", { user1: req.user[0], user2:req.user[1] }));
router.get('/auth/failure', (req, res) => res.render("homepage", { error: ["failed to authenticate email"] }));
router.get('/logout', (req, res) => req.logout(err => { 
    if (err) return res.status(500).send("Logout failed");
    req.session.destroy(err => { if (err) return next(err); res.clearCookie('connect.sid').redirect('/'); }); 
}));


module.exports = router;
