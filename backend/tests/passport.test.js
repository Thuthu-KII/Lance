const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth2');
const { Username } = require('../config/passport');
const path = require('path');

jest.mock('../models/userModel.js', () => {
  return {
    addUser: {
      run: jest.fn()
    },
    findUserByGoogleId: {
      get: jest.fn()
    }
  };
});

describe('Google OAuth Passport Strategy', () => {
  const mockProfile = {
    id: 'google123',
    displayName: 'John Doe',
    emails: [{ value: 'john@example.com' }]
  };

  const mockReq = {
    query: { state: 'Freelancer' }
  };

  const mockAccessToken = 'mockAccessToken';
  const mockRefreshToken = 'mockRefreshToken';

  let strategy;
  let userModel;

  beforeAll(() => {
    userModel = require('../models/userModel.js');
    strategy = passport._strategies.google;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call addUser if user does not exist', async () => {
    userModel.findUserByGoogleId.get.mockReturnValueOnce(undefined);

    await new Promise((resolve, reject) => {
      strategy._verify(mockReq, mockAccessToken, mockRefreshToken, mockProfile, (err, user) => {
        try {
          expect(err).toBeNull();
          expect(user.email).toBe('john@example.com');
          expect(userModel.addUser.run).toHaveBeenCalled();
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('should skip addUser if user already exists', async () => {
    userModel.findUserByGoogleId.get.mockReturnValueOnce({ googleId: 'google123' });

    await new Promise((resolve, reject) => {
      strategy._verify(mockReq, mockAccessToken, mockRefreshToken, mockProfile, (err, user) => {
        try {
          expect(err).toBeNull();
          expect(user.email).toBe('john@example.com');
          expect(userModel.addUser.run).not.toHaveBeenCalled();
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });
});

describe('Passport serialize/deserialize', () => {
  const mockUser = { googleId: 'google123', role: 'Freelancer' };

  it('should serialize user by googleId', () => {
    passport.serializeUser(mockUser, (err, id) => {
      expect(err).toBeNull();
      expect(id).toBe('google123');
    });
  });

  it('should deserialize user from googleId and role', () => {
    const { findUserByGoogleId } = require('../models/userModel.js');
    findUserByGoogleId.get.mockReturnValueOnce({ id: 'google123', role: 'Freelancer' });

    passport.deserializeUser('google123', (err, userArray) => {
      expect(err).toBeNull();
      expect(userArray[1]).toMatchObject({ id: 'google123', role: 'Freelancer' });
    });
  });

  it('should handle missing user in deserialize', () => {
    const { findUserByGoogleId } = require('../models/userModel.js');
    findUserByGoogleId.get.mockReturnValueOnce(undefined);

    passport.deserializeUser('missingId', (err, userArray) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('User not found');
    });
  });
});
