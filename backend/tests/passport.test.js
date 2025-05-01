const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth2');
const path = require('path');

// Mock environment variables
jest.mock('dotenv', () => ({
  config: jest.fn(() => ({
    parsed: {
      GOOGLE_CLIENT_ID: 'mock-client-id',
      GOOGLE_CLIENT_SECRET: 'mock-client-secret'
    }
  }))
}));

// Mock userModel functions
jest.mock('../models/userModel.js', () => ({
  addUser: {
    run: jest.fn()
  },
  findUserByGoogleId: {
    get: jest.fn()
  }
}));

const { addUser, findUserByGoogleId } = require('../models/userModel');
const { passport } = require('../config/passport');

describe('Google Passport Strategy', () => {
  const mockProfile = {
    id: 'google-id-123',
    displayName: 'Test User',
    emails: [{ value: 'test@example.com' }]
  };

  const req = {
    query: {
      state: 'freelancer'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should add new user if not found', (done) => {
    findUserByGoogleId.get.mockReturnValueOnce(null);

    const strategy = passport._strategy('google');

    strategy._verify(req, null, null, mockProfile, (err, user) => {
      expect(err).toBeNull();
      expect(user).toEqual({
        googleId: mockProfile.id,
        displayName: mockProfile.displayName,
        email: mockProfile.emails[0].value
      });
      expect(addUser.run).toHaveBeenCalledWith({
        googleId: 'google-id-123',
        role: 'freelancer'
      });
      expect(findUserByGoogleId.get).toHaveBeenCalledTimes(2); // once before add, once after
      done();
    });
  });

  test('should use existing user if found', (done) => {
    const mockUser = { googleId: 'google-id-123', role: 'freelancer' };
    findUserByGoogleId.get.mockReturnValueOnce(mockUser);

    const strategy = passport._strategy('google');

    strategy._verify(req, null, null, mockProfile, (err, user) => {
      expect(err).toBeNull();
      expect(user).toEqual({
        googleId: mockProfile.id,
        displayName: mockProfile.displayName,
        email: mockProfile.emails[0].value
      });
      expect(addUser.run).not.toHaveBeenCalled();
      done();
    });
  });

  test('should handle errors in callback', (done) => {
    const error = new Error('DB failure');
    findUserByGoogleId.get.mockImplementation(() => { throw error; });

    const strategy = passport._strategy('google');

    strategy._verify(req, null, null, mockProfile, (err, user) => {
      expect(err).toBe(error);
      expect(user).toBeUndefined();
      done();
    });
  });
});
