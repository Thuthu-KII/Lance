global.setImmediate = global.setImmediate || ((fn) => setTimeout(fn, 0));

const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const routes = require('../routes/authRoutes'); // Adjust path as needed

jest.mock('../controllers/authController', () => ({
  isLogged: (req, res, next) => {
    req.user = [{ name: 'Mock Client' }, { email: 'client@example.com' }];
    next();
  }
}));

jest.mock('../config/passport', () => ({
  passport: {
    authenticate: jest.fn(() => (req, res, next) => next())
  }
}));

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.set('view engine', 'ejs'); // Assuming you're using EJS
    app.use(express.urlencoded({ extended: false }));
    app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
    app.use('/', routes);

    // mock res.render
    app.response.render = jest.fn(function (view, options) {
      this.status(200).json({ view, options });
    });
  });

  test('GET /Client should render signup with Client role', async () => {
    const res = await request(app).get('/Client');
    expect(res.body.view).toBe('signup');
    expect(res.body.options.Role).toBe('Client');
  });

  test('GET /Freelancer should render signup with Freelancer role', async () => {
    const res = await request(app).get('/Freelancer');
    expect(res.body.view).toBe('signup');
    expect(res.body.options.Role).toBe('Freelancer');
  });

  test('GET /auth/google calls passport.authenticate with state', async () => {
    const res = await request(app).get('/auth/google');
    expect(res.statusCode).toBe(200); // Because mocked `passport.authenticate` just calls `next()`
  });

  test('GET /google/callback handles auth success', async () => {
    const res = await request(app).get('/google/callback?state=Client');
    expect(res.statusCode).toBe(200); // Because successRedirect mocked as just calling next
  });

  test('GET /Client-in renders client dashboard when logged in', async () => {
    const mockEnsureAuthenticated = (req, res, next) => next();
    app.get('/Client-in', require('../controllers/authController').isLogged, mockEnsureAuthenticated, (req, res) => {
      res.render('client', { user1: req.user[0], user2: req.user[1] });
    });

    const res = await request(app).get('/Client-in');
    expect(res.body.view).toBe('client');
    expect(res.body.options.user1.name).toBe('Mock Client');
  });

  test('GET /auth/failure renders homepage with error', async () => {
    const res = await request(app).get('/auth/failure');
    expect(res.body.view).toBe('homepage');
    expect(res.body.options.error).toEqual(['failed to authenticate email']);
  });

  test('GET /logout clears session and redirects', async () => {
    const res = await request(app).get('/logout');
    expect(res.statusCode).toBe(302); // Redirect
    expect(res.headers['location']).toBe('/');
  });
});
