const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const helmet = require('helmet');
const methodOverride = require('method-override');
const { Pool } = require('pg');
require('dotenv').config();

// Import database pool for session store
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const freelancerRoutes = require('./routes/freelancerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const jobRoutes = require('./routes/jobRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoute = require('./routes/upload')

// Import passport config
require('./config/passport');

// Create Express app 
const app = express();

// Trust proxy when running behind a load balancer (e.g., Azure)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.set('view engine', 'ejs');
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'common/layout');

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.yoco.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://api.yoco.com"]
    }
  }
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// Session configuration with PostgreSQL store
//console.log("SESSION_SECRET:", process.env.SESSION_SECRET);
app.use(session({
  store: new pgSession({
    pool: db.pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // ensures cookies only sent over HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/client', clientRoutes);
app.use('/freelancer', freelancerRoutes);
app.use('/admin', adminRoutes);
app.use('/jobs', jobRoutes);
app.use('/payments', paymentRoutes);
app.use('/profile', profileRoutes);
app.use('/',uploadRoute);

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'Page not found',
    status: 404
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Something went wrong!',
    status: err.status || 500
  });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
