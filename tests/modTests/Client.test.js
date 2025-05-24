const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const Client = require('../../models/Client');
const db = require('../../config/database');

jest.mock('../../config/database');

describe('Client Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return client when user ID is found', async () => {
      const mockClient = { id: 1, user_id: 10, first_name: 'Jane', last_name: 'Doe' };
      db.query.mockResolvedValue({ rows: [mockClient] });

      const result = await Client.findByUserId(10);
      expect(result).toEqual(mockClient);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM clients WHERE user_id = $1', [10]);
    });

    it('should return null when no client is found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Client.findByUserId(99);
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return client by ID', async () => {
      const mockClient = { id: 2, user_id: 11, first_name: 'John' };
      db.query.mockResolvedValue({ rows: [mockClient] });

      const result = await Client.findById(2);
      expect(result).toEqual(mockClient);
    });

    it('should return null if client not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Client.findById(404);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return new client', async () => {
      const clientData = {
        userId: 1,
        firstName: 'Alice',
        lastName: 'Smith',
        companyName: 'Acme Inc',
        phone: '123456789',
        address: '123 Street',
        skills: 'JavaScript,Node.js',
        experience: '3 years',
        cvPath: '/uploads/cv.pdf',
      };
      const mockResult = { ...clientData, id: 5 };
      db.query.mockResolvedValue({ rows: [mockResult] });

      const result = await Client.create(clientData);
      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should update and return updated client', async () => {
      const updateData = {
        firstName: 'Alice',
        lastName: 'Johnson',
        companyName: 'Tech Co',
        phone: '987654321',
        address: '456 Avenue',
        skills: 'React',
        experience: '4 years',
        cvPath: '/uploads/new_cv.pdf',
      };
      const mockResult = { id: 1, ...updateData };
      db.query.mockResolvedValue({ rows: [mockResult] });

      const result = await Client.update(1, updateData);
      expect(result).toEqual(mockResult);
    });

    it('should return existing client if no data to update', async () => {
      const existingClient = { id: 1, first_name: 'Existing' };
      db.query.mockResolvedValue({ rows: [existingClient] });

      const result = await Client.update(1, {});
      expect(result).toEqual(existingClient);
    });
  });

  describe('getWithUserDetails', () => {
    it('should return client with user details', async () => {
      const mockResult = {
        id: 1,
        user_id: 1,
        email: 'test@example.com',
        user_created_at: new Date(),
      };
      db.query.mockResolvedValue({ rows: [mockResult] });

      const result = await Client.getWithUserDetails(1);
      expect(result).toEqual(mockResult);
    });

    it('should return null if client not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Client.getWithUserDetails(404);
      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return all clients with user details', async () => {
      const mockClients = [{ id: 1 }, { id: 2 }];
      db.query.mockResolvedValue({ rows: mockClients });

      const result = await Client.getAll();
      expect(result).toEqual(mockClients);
    });
  });

  describe('count', () => {
    it('should return total count of clients', async () => {
      db.query.mockResolvedValue({ rows: [{ count: '5' }] });

      const result = await Client.count();
      expect(result).toBe(5);
    });
  });

  describe('getJobs', () => {
    it('should return jobs for a client', async () => {
      const mockJobs = [
        { id: 1, title: 'Job A' },
        { id: 2, title: 'Job B' },
      ];
      db.query.mockResolvedValue({ rows: mockJobs });

      const result = await Client.getJobs(1);
      expect(result).toEqual(mockJobs);
    });
  });
});
