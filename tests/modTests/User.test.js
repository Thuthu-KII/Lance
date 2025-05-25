const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const db = require('../../config/database');
const User = require('../../models/User'); 
const bcrypt = require('bcryptjs');

jest.mock('../../config/database');
jest.mock('bcryptjs');

describe('User Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user when found by ID', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'test@example.com' }] });

      const result = await User.findById(1);
      expect(result).toEqual({ id: 1, email: 'test@example.com' });
    });

    it('should return null if user not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await User.findById(999);
      expect(result).toBeNull();
    });

    it('should throw on DB error', async () => {
      db.query.mockRejectedValueOnce(new Error('DB Error'));
      await expect(User.findById(1)).rejects.toThrow('DB Error');
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ email: 'test@example.com' }] });

      const result = await User.findByEmail('test@example.com');
      expect(result).toEqual({ email: 'test@example.com' });
    });

    it('should return null if email not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await User.findByEmail('no@domain.com');
      expect(result).toBeNull();
    });

    it('should throw on DB error', async () => {
      db.query.mockRejectedValueOnce(new Error('DB error'));
      await expect(User.findByEmail('fail@test.com')).rejects.toThrow('DB error');
    });
  });

  describe('create', () => {
    it('should create and return user', async () => {
      const user = { email: 'new@test.com', password: '123', role: 'client' };

      db.query
        .mockResolvedValueOnce({ rows: [] }) // findByEmail
        .mockResolvedValueOnce({ rows: [{ id: 1, email: user.email }] });

      bcrypt.hash.mockResolvedValueOnce('hashed123');

      const result = await User.create(user);
      expect(result).toEqual({ id: 1, email: user.email });
    });

    it('should throw if email already registered', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 2 }] });

      await expect(User.create({ email: 'exists@test.com' }))
        .rejects.toThrow('Email already registered');
    });

    it('should throw if bcrypt fails', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      bcrypt.hash.mockRejectedValueOnce(new Error('Hashing error'));

      await expect(User.create({ email: 'fail@test.com', password: '123' }))
        .rejects.toThrow('Hashing error');
    });

    it('should throw on DB insert failure', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] }) // findByEmail
        .mockRejectedValueOnce(new Error('Insert error'));

      bcrypt.hash.mockResolvedValueOnce('hashed');

      await expect(User.create({ email: 'fail@test.com', password: '123' }))
        .rejects.toThrow('Insert error');
    });
  });

  describe('update', () => {
    it('should update and return updated user', async () => {
      const id = 1;
      const data = { password: 'newpass', email: 'updated@test.com' };

      bcrypt.hash.mockResolvedValueOnce('hashedNew');
      db.query.mockResolvedValueOnce({ rows: [{ id, email: data.email }] });

      const result = await User.update(id, data);
      expect(result).toEqual({ id, email: data.email });
    });

    it('should return current user if no update data', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'current@test.com' }] });

      const result = await User.update(1, {});
      expect(result).toEqual({ id: 1, email: 'current@test.com' });
    });

    it('should throw if bcrypt fails', async () => {
      bcrypt.hash.mockRejectedValueOnce(new Error('Hash error'));

      await expect(User.update(1, { password: 'pass' })).rejects.toThrow('Hash error');
    });

    it('should throw on DB error', async () => {
      db.query.mockRejectedValueOnce(new Error('Update fail'));

      await expect(User.update(1, { email: 'x@test.com' })).rejects.toThrow('Update fail');
    });
  });

  describe('delete', () => {
    it('should delete and return deleted user', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const result = await User.delete(1);
      expect(result).toEqual({ id: 1 });
    });

    it('should return null if user not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await User.delete(999);
      expect(result).toBeNull();
    });

    it('should throw on DB error', async () => {
      db.query.mockRejectedValueOnce(new Error('Delete error'));

      await expect(User.delete(1)).rejects.toThrow('Delete error');
    });
  });

  describe('comparePassword', () => {
    it('should return true if passwords match', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const result = await User.comparePassword('plain', 'hash');
      expect(result).toBe(true);
    });

    it('should return false if passwords do not match', async () => {
      bcrypt.compare.mockResolvedValue(false);
      const result = await User.comparePassword('plain', 'hash');
      expect(result).toBe(false);
    });

    it('should throw if bcrypt.compare fails', async () => {
      bcrypt.compare.mockRejectedValueOnce(new Error('Compare error'));

      await expect(User.comparePassword('a', 'b')).rejects.toThrow('Compare error');
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      db.query.mockResolvedValueOnce({});
      await expect(User.updateLastLogin(1)).resolves.not.toThrow();
    });

    it('should throw on DB error', async () => {
      db.query.mockRejectedValueOnce(new Error('Timestamp error'));
      await expect(User.updateLastLogin(1)).rejects.toThrow('Timestamp error');
    });
  });

  describe('countByRole', () => {
    it('should return numeric count of users', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ count: '5' }] });
      const count = await User.countByRole('client');
      expect(count).toBe(5);
    });

    it('should throw on DB error', async () => {
      db.query.mockRejectedValueOnce(new Error('Count error'));
      await expect(User.countByRole('x')).rejects.toThrow('Count error');
    });
  });

  describe('getAllWithProfiles', () => {
    it('should return list of users with profile data', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, full_name: 'Test User', is_approved: true }]
      });

      const result = await User.getAllWithProfiles();
      expect(result).toHaveLength(1);
    });

    it('should throw on DB error', async () => {
      db.query.mockRejectedValueOnce(new Error('Profiles fail'));

      await expect(User.getAllWithProfiles()).rejects.toThrow('Profiles fail');
    });
  });

  describe('getWithProfile', () => {
    it('should return user and profile data for client', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, role: 'client', email: 'x@test.com' }] })
        .mockResolvedValueOnce({ rows: [{ first_name: 'John', last_name: 'Doe' }] });

      const result = await User.getWithProfile(1);
      expect(result.profile).toEqual({ first_name: 'John', last_name: 'Doe' });
    });

    it('should return user and profile data for freelancer', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 2, role: 'freelancer', email: 'free@test.com' }] })
        .mockResolvedValueOnce({ rows: [{ skills: 'JavaScript' }] });

      const result = await User.getWithProfile(2);
      expect(result.profile).toEqual({ skills: 'JavaScript' });
    });

    it('should return null if user not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await User.getWithProfile(999);
      expect(result).toBeNull();
    });

    it('should throw on DB error', async () => {
      db.query.mockRejectedValueOnce(new Error('Join fail'));

      await expect(User.getWithProfile(1)).rejects.toThrow('Join fail');
    });
  });
});
