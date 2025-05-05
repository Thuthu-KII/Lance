const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const pageRoutes = require('./routes/pageRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware for session,passport.
app.use(session({
    secret: "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",
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Set View Engine
app.set("view engine", "ejs");

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Use routes
app.use(authRoutes);
app.use(pageRoutes);
app.use('/client',userRoutes);


// Server Listening
// const PORT = 3000  || process.env.PORT;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
console.log("Setting up server...");
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
console.log("App started successfully");
