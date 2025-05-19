const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const Admin = require('../../models/Admin');
const db = require('../../config/database');

jest.mock('../../config/database');

describe('Admin Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return admin when found', async () => {
      const mockAdmin = { id: 1, user_id: 10, first_name: 'Jane', last_name: 'Doe' };
      db.query.mockResolvedValue({ rows: [mockAdmin] });

      const result = await Admin.findByUserId(10);
      expect(result).toEqual(mockAdmin);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM admins WHERE user_id = $1', [10]);
    });

    it('should return null when no admin is found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Admin.findByUserId(99);
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return admin by ID', async () => {
      const mockAdmin = { id: 2, user_id: 11, first_name: 'John', last_name: 'Smith' };
      db.query.mockResolvedValue({ rows: [mockAdmin] });

      const result = await Admin.findById(2);
      expect(result).toEqual(mockAdmin);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM admins WHERE id = $1', [2]);
    });
  });

  describe('create', () => {
    it('should create a new admin', async () => {
      const newAdminData = {
        userId: 20,
        firstName: 'Alice',
        lastName: 'Wonderland'
      };
      const mockResult = { id: 3, user_id: 20, first_name: 'Alice', last_name: 'Wonderland' };

      db.query.mockResolvedValue({ rows: [mockResult] });

      const result = await Admin.create(newAdminData);
      expect(result).toEqual(mockResult);
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO admins (user_id, first_name, last_name) VALUES ($1, $2, $3) RETURNING *',
        [20, 'Alice', 'Wonderland']
      );
    });
  });

  describe('update', () => {
    it('should update an admin profile', async () => {
      const updatedAdmin = {
        id: 4,
        user_id: 21,
        first_name: 'Updated',
        last_name: 'Admin',
        updated_at: expect.any(Date)
      };

      const mockReturn = {
        ...updatedAdmin,
        updated_at: new Date()
      };

      db.query.mockResolvedValue({ rows: [mockReturn] });

      const result = await Admin.update(4, {
        firstName: 'Updated',
        lastName: 'Admin'
      });

      expect(result).toMatchObject({
        id: 4,
        first_name: 'Updated',
        last_name: 'Admin'
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE admins'),
        expect.arrayContaining(['Updated', 'Admin', expect.any(Date), 4])
      );
    });
  });

  describe('getAll', () => {
    it('should return all admins', async () => {
      const mockAdmins = [
        { id: 1, user_id: 10, first_name: 'Admin1', email: 'admin1@example.com' },
        { id: 2, user_id: 11, first_name: 'Admin2', email: 'admin2@example.com' }
      ];

      db.query.mockResolvedValue({ rows: mockAdmins });

      const result = await Admin.getAll();
      expect(result).toEqual(mockAdmins);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT a.*, u.email'), undefined);
    });
  });

  describe('count', () => {
    it('should return the total number of admins', async () => {
      db.query.mockResolvedValue({ rows: [{ count: '5' }] });

      const result = await Admin.count();
      expect(result).toBe(5);
      expect(db.query).toHaveBeenCalledWith('SELECT COUNT(*) FROM admins');
    });
  });
});
