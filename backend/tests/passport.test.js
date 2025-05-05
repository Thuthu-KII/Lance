const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth2');
const { addUser, findUserByGoogleId } = require('../models/userModel');
require('dotenv').config(); // Load environment variables from .env file

// Mock userModel functions
jest.mock('../models/userModel', () => ({
  addUser: {
    run: jest.fn()
  },
  findUserByGoogleId: {
    get: jest.fn()
  }
}));

// Setup mock passport strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: 'ChinaFDBIYM',
      clientSecret: 'KenyaFDBIYM',
      callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user exists
        const user = await findUserByGoogleId.get(profile.id);
        if (user) {
          return done(null, user); // Return existing user
        }

        // If no user, create new one
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          role: 'Freelancer' // Default role
        };

        await addUser.run(newUser); // Save new user to database
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

describe('Google Passport Strategy', () => {
  const mockProfile = {
    id: 'google-id-123',
    displayName: 'Test User',
    emails: [{ value: 'test@example.com' }]
  };

  const req = {
    query: {
      state: 'freelancer'
    },
    // Add the user property for passport to recognize
    user: null
  };

  // Mock response object
  const res = {
    status: jest.fn().mockReturnThis(), // Mock status method
    send: jest.fn(), // Mock send method
    setHeader: jest.fn(),
    end: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should add new user if not found', (done) => {
    // Mock that the user is not found in the database
    findUserByGoogleId.get.mockReturnValueOnce(null);

    // Use the authenticate method to trigger passport's Google strategy
    passport.authenticate('google', (err, user) => {
      expect(err).toBeNull();
      expect(user).toEqual({
        googleId: mockProfile.id,
        displayName: mockProfile.displayName,
        email: mockProfile.emails[0].value,
        role: 'freelancer'
      });
      expect(addUser.run).toHaveBeenCalledWith({
        googleId: 'google-id-123',
        displayName: 'Test User',
        email: 'test@example.com',
        role: 'freelancer'
      });
      expect(findUserByGoogleId.get).toHaveBeenCalledTimes(1); // Only once before adding new user
      done();
    })({ query: req.query }, res, () => {}); // Pass the mock req and res
  });

  test('should use existing user if found', (done) => {
    const mockUser = { googleId: 'google-id-123', role: 'freelancer' };
    findUserByGoogleId.get.mockReturnValueOnce(mockUser);

    // Use the authenticate method to trigger passport's Google strategy
    passport.authenticate('google', (err, user) => {
      expect(err).toBeNull();
      expect(user).toEqual({
        googleId: mockProfile.id,
        displayName: mockProfile.displayName,
        email: mockProfile.emails[0].value
      });
      expect(addUser.run).not.toHaveBeenCalled(); // Add user should not be called
      done();
    })({ query: req.query }, res, () => {}); // Pass the mock req and res
  });

  test('should handle errors in callback', (done) => {
    const error = new Error('DB failure');
    findUserByGoogleId.get.mockImplementationOnce(() => {
      throw error;
    });

    // Use the authenticate method to trigger passport's Google strategy
    passport.authenticate('google', (err, user) => {
      expect(err).toBe(error);
      expect(user).toBeUndefined();
      done();
    })({ query: req.query }, res, () => {}); // Pass the mock req and res
  });
});
