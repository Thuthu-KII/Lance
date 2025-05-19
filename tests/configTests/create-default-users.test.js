require('dotenv').config({ path: '.env.test' }); 

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock pg module
const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};
const mockPool = {
  connect: jest.fn().mockResolvedValue(mockClient),
  query: jest.fn(),
  end: jest.fn(),
};

jest.mock('pg', () => ({
  Pool: jest.fn(() => mockPool),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

const bcrypt = require('bcryptjs');
const { createDefaultUsers } = require('../../config/scripts/create-default-users');
const { Pool } = require('pg');

describe('createDefaultUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockClient.query.mockImplementation((query, params) => {
      if (query === 'SELECT * FROM users WHERE email = $1') {
        return Promise.resolve({ rows: [] });
      }
      if (query.includes('INSERT INTO users')) {
        return Promise.resolve({ rows: [{ id: 1 }] });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  it('should create admin user if it does not exist', async () => {
    await createDefaultUsers();

    expect(mockClient.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE email = $1',
      ['admin@example.com']
    );

    expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 10);

    expect(mockClient.query).toHaveBeenCalledWith(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      ['admin@example.com', 'hashed_password', 'admin']
    );

    expect(mockClient.query).toHaveBeenCalledWith(
      'INSERT INTO admins (user_id, first_name, last_name) VALUES ($1, $2, $3)',
      [1, 'System', 'Administrator']
    );
  });

  it('should create client user if it does not exist', async () => {
    await createDefaultUsers();

    expect(mockClient.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE email = $1',
      ['client@example.com']
    );

    expect(bcrypt.hash).toHaveBeenCalledWith('client123', 10);

    expect(mockClient.query).toHaveBeenCalledWith(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      ['client@example.com', 'hashed_password', 'client']
    );

    expect(mockClient.query).toHaveBeenCalledWith(
      'INSERT INTO clients (user_id, first_name, last_name, company_name, skills, experience) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        1,
        'Test',
        'Client',
        'Test Company',
        ['Web Development', 'Design', 'Marketing'],
        'We are a small company looking for skilled freelancers for various projects.',
      ]
    );
  });

  it('should create freelancer user if it does not exist', async () => {
    await createDefaultUsers();

    expect(mockClient.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE email = $1',
      ['freelancer@example.com']
    );

    expect(bcrypt.hash).toHaveBeenCalledWith('freelancer123', 10);

    expect(mockClient.query).toHaveBeenCalledWith(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      ['freelancer@example.com', 'hashed_password', 'freelancer']
    );

    expect(mockClient.query).toHaveBeenCalledWith(
      'INSERT INTO freelancers (user_id, first_name, last_name, skills, experience, is_approved) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        1,
        'Test',
        'Freelancer',
        ['Web Development', 'JavaScript', 'React', 'Node.js'],
        'Experienced web developer with 5 years of experience in full-stack development.',
        true,
      ]
    );
  });

  it('should create sample job if it does not exist', async () => {
    mockClient.query.mockImplementation((query, params) => {
      if (query.includes('SELECT c.id FROM clients c')) {
        return Promise.resolve({ rows: [{ id: 1 }] });
      }
      if (query === 'SELECT * FROM jobs WHERE title = $1') {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    await createDefaultUsers();

    expect(mockClient.query).toHaveBeenCalledWith(
      'SELECT * FROM jobs WHERE title = $1',
      ['Sample Web Development Project']
    );

    expect(mockClient.query).toHaveBeenCalledWith(
      'INSERT INTO jobs (client_id, title, description, requirements, budget, status, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        1,
        'Sample Web Development Project',
        'We need a skilled developer to build a responsive website for our company.',
        'HTML, CSS, JavaScript, Responsive Design',
        1000.0,
        'open',
        'paid',
      ]
    );
  });

  it('should not create users that already exist', async () => {
    mockClient.query.mockImplementation((query, params) => {
      if (query === 'SELECT * FROM users WHERE email = $1' && params[0] === 'admin@example.com') {
        return Promise.resolve({ rows: [{ id: 1 }] });
      }
      return Promise.resolve({ rows: [] });
    });

    await createDefaultUsers();

    expect(mockClient.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE email = $1',
      ['admin@example.com']
    );

    expect(mockClient.query).not.toHaveBeenCalledWith(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      expect.arrayContaining(['admin@example.com'])
    );
  });

  it('should handle errors and rollback transaction', async () => {
    mockClient.query.mockRejectedValue(new Error('Database error'));

    await createDefaultUsers();

    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('should commit transaction if everything succeeds', async () => {
    await createDefaultUsers();

    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockClient.release).toHaveBeenCalled();
    expect(mockPool.end).toHaveBeenCalled();
  });
});
