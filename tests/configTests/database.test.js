jest.mock('pg', () => {
  const mClient = {
    connect: jest.fn(),
    release: jest.fn(),
    query: jest.fn(),
    on: jest.fn(),
  };

  const mPool = {
    connect: jest.fn().mockResolvedValue(mClient),
    query: jest.fn(),
    on: jest.fn(),
  };

  return { Pool: jest.fn(() => mPool) };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed_password')),
}));

require('dotenv').config({ path: '.env.test' }); // Use a test-specific .env file

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const db = require('../../config/database'); 

describe('Database Config', () => {
  let mockPool;
  let mockClient;

  beforeEach(() => {
    mockPool = Pool.mock.instances[0];
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    mockPool.connect.mockResolvedValue(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a pool with correct config', () => {
    expect(Pool).toHaveBeenCalledWith(expect.objectContaining({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT, 10),
    }));
  });

  test('should expose query and getClient functions', () => {
    expect(typeof db.query).toBe('function');
    expect(typeof db.getClient).toBe('function');
    expect(typeof db.pool).toBe('object');
  });

  test('should insert admin if not exists', async () => {
    mockClient.query.mockImplementation((queryText) => {
      if (queryText.includes('SELECT * FROM users WHERE email')) {
        return Promise.resolve({ rowCount: 0 }); // simulate no admin
      }
      if (queryText.includes('INSERT INTO users')) {
        return Promise.resolve({ rows: [{ id: 1 }] });
      }
      return Promise.resolve();
    });

    const initializeDatabase = require('../path/to/your/db/file').initializeDatabase;
    await initializeDatabase();

    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      expect.arrayContaining(['admin@example.com', 'hashed_password', 'admin'])
    );
    expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 10);
  });

  test('should create session table', async () => {
    const createSessionTable = require('../path/to/your/db/file').createSessionTable;
    await createSessionTable();

    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS "session"'));
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('CREATE INDEX IF NOT EXISTS'));
  });

  test('should not insert admin if already exists', async () => {
    mockClient.query.mockImplementation((queryText) => {
      if (queryText.includes('SELECT * FROM users WHERE email')) {
        return Promise.resolve({ rowCount: 1 }); // simulate existing admin
      }
      return Promise.resolve();
    });

    const initializeDatabase = require('../path/to/your/db/file').initializeDatabase;
    await initializeDatabase();

    expect(mockClient.query).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      expect.arrayContaining(['admin@example.com'])
    );
  });
});
