require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const db = require('./config/database');
const logger = require('./config/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const jobRoutes = require('./routes/jobRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Import middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Initialize app
const app = express();

// Session configuration
app.use(session({
  store: new pgSession({
    pool: db.pool,
    tableName: 'user_sessions'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/jobs', jobRoutes);
app.use('/payments', paymentRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;