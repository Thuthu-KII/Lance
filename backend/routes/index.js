// ENTRY POINT
const express = require('express'); // Import express package
const app = express(); // Create an instance of express
const session = require('express-session');
const passport = require('passport');
const auth = require("./auth.js"); // Load custom auth logic

const db = require("better-sqlite3")("LANCE.db");
const bcrypt = require("bcrypt");

db.pragma("journal_mode=WAL"); // Enable Write-Ahead Logging for better concurrency

// USER MODEL
const createTables = db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        googleId TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        displayName TEXT NOT NULL
    )
`).run();

const addUser = db.prepare(`
    INSERT OR IGNORE INTO users (googleId, email, displayName) 
    VALUES (@googleId, @email, @displayName)
`); // Insert user or ignore if already exists

const findUserByGoogleId = db.prepare(`
    SELECT * FROM users WHERE googleId = ?
`); // Find user by Google ID

const findUserByEmail = db.prepare(`
    SELECT * FROM users WHERE email = ?
`); // Find user by email

const findUserById = db.prepare('SELECT * FROM users WHERE id = ?');

// MIDDLEWARE
app.use(session({
    secret: "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",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize()); // Initialize Passport
app.use(passport.session());    // Enable persistent login sessions

app.set("view engine", "ejs"); // Set EJS as the view engine
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded form data
app.use(express.static("public")); // Serve static files from public folder

app.use((req, res, next) => {
    res.locals.error = [];
    next(); // Continue to the next middleware
});

// UTIL FUNCTIONS
function isLogged(req, res, next) {
    req.user ? next() : res.sendStatus(401); // Allow if logged in, else 401
}

// GOOGLE OAUTH ROUTES
app.get("/auth/google", 
    passport.authenticate('google', { scope: ["email", "profile"] })
);

app.get("/google/callback", 
    passport.authenticate('google', {
        failureRedirect: 'auth/failure',
        successRedirect: "/signed",
    })
);

app.get('/signed', isLogged, (req, res) => {
    const { userName } = require('./auth');
    res.render("main", { user: req.user });
});

app.get('/auth/failure', (req, res) => {
    error.push("failed to authenticate email");
    res.render("homepage", { error });
});

app.get('/logout', (req, res, next) => {
    req.logout((err) => { // Logout user from Passport
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Logout failed");
        }
        req.session.destroy((err) => { // Destroy session
            if (err) return next(err);
            res.clearCookie('connect.sid'); // Clear session cookie
            res.redirect('/'); // Redirect to homepage
        });
    });
});

// ROUTES
app.get("/", (req, res) => {
    error = [];
    res.render("homepage");
});

app.get("/login", (req, res) => {
   // res.render("login");
    res.status(200).render("login");
});

app.get("/contacts", (req, res) => {
    res.render("contacts");
});

// app.post("/register", (req, res) => {
//     const error = [];

//     // Validate input
//     if (typeof(req.body.username) !== "string") req.body.username = "";
//     if (typeof(req.body.password) !== "string") req.body.password = "";

//     req.body.username = req.body.username.trim();

//     if (!req.body.username) {
//         error.push({ message: "You need to provide a username" });
//         return res.render("homepage", { error });
//     }

//     if (req.body.username.length > 10 || req.body.username.length < 3) {
//         error.push({ message: "Username must be between 3 and 10 characters" });
//     }

//     if (!req.body.password) {
//         error.push({ message: "You need to provide a password" });
//         return res.render("homepage", { error });
//     }

//     if (req.body.password.length > 10 || req.body.password.length < 3) {
//         error.push({ message: "Password must be between 3 and 10 characters" });
//     }

//     if (!/^[a-zA-Z0-9]+$/.test(req.body.username)) {
//         error.push({ message: "Username must not contain special characters" });
//     }

//     if (error.length > 0) {
//         return res.render("homepage", { error });
//     }

//     // Save user to DB
//     const statement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
//     const salt = bcrypt.genSaltSync(10);
//     req.body.password = bcrypt.hashSync(req.body.password, salt);

//     try {
//         statement.run(req.body.username, req.body.password);
//     } catch (err) {
//         error.push({ message: "User already exists" });
//         return res.render("homepage", { error });
//     }

//     // Render login after successful registration
//     res.render("login");
// });

// SERVER
const PORT = 3000;
app.listen(PORT, () => {
   // console.log("Listening on",PORT);
});

// EXPORTS
module.exports = {
    app,db, addUser, createTables, findUserByEmail, findUserByGoogleId, findUserById
};
//module.exports = app

// Require auth.js after exports are fully defined
// require('./auth');
