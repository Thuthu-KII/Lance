const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const request = require('supertest');
const express = require('express');
const { isLogged } = require('../controllers/authController'); // adjust path if needed

describe('isLogged Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();

    // Middleware to simulate a logged-in user
    app.use((req, res, next) => {
      req.user = { id: '123', name: 'Test User' }; // simulate logged-in user
      next();
    });

    // Protected route
    app.get('/protected', isLogged, (req, res) => {
      res.status(200).send('You are logged in!');
    });
  });

  it('should allow access when user is logged in', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('You are logged in!');
  });

  it('should block access when user is not logged in', async () => {
    const appWithoutUser = express();

    appWithoutUser.get('/protected', isLogged, (req, res) => {
      res.status(200).send('You are logged in!');
    });

    const res = await request(appWithoutUser).get('/protected');
    expect(res.statusCode).toBe(401);
  });
});
