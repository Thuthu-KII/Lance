require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport').passport;
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const pageRoutes = require('./routes/pageRoutes');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static & body parsers
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session & passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', pageRoutes);
app.use('/', authRoutes);
app.use('/client', userRoutes);
app.use('/freelancer', applicationRoutes);
app.use('/jobs', jobRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/admin', adminRoutes);

// Sync DB then start
sequelize.sync()
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(console.error);
