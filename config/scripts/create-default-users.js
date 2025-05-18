/**
 * Script to create default users for testing
 * Run with: node scripts/create-default-users.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createDefaultUsers() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Creating default users...');
    
    // Create admin user if not exists
    const adminExists = await client.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@example.com']
    );
    
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminInsert = await client.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
        ['admin@example.com', hashedPassword, 'admin']
      );
      
      await client.query(
        'INSERT INTO admins (user_id, first_name, last_name) VALUES ($1, $2, $3)',
        [adminInsert.rows[0].id, 'System', 'Administrator']
      );
      
      console.log('Created admin user: admin@example.com / admin123');
    } else {
      console.log('Admin user already exists');
    }
    
    // Create test client
    const clientExists = await client.query(
      'SELECT * FROM users WHERE email = $1',
      ['client@example.com']
    );
    
    if (clientExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('client123', 10);
      
      const clientInsert = await client.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
        ['client@example.com', hashedPassword, 'client']
      );
      
      await client.query(
        'INSERT INTO clients (user_id, first_name, last_name, company_name, skills, experience) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          clientInsert.rows[0].id, 
          'Test', 
          'Client', 
          'Test Company', 
          ['Web Development', 'Design', 'Marketing'],
          'We are a small company looking for skilled freelancers for various projects.'
        ]
      );
      
      console.log('Created client user: client@example.com / client123');
    } else {
      console.log('Client user already exists');
    }
    
    // Create test freelancer
    const freelancerExists = await client.query(
      'SELECT * FROM users WHERE email = $1',
      ['freelancer@example.com']
    );
    
    if (freelancerExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('freelancer123', 10);
      
      const freelancerInsert = await client.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
        ['freelancer@example.com', hashedPassword, 'freelancer']
      );
      
      await client.query(
        'INSERT INTO freelancers (user_id, first_name, last_name, skills, experience, is_approved) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          freelancerInsert.rows[0].id, 
          'Test', 
          'Freelancer', 
          ['Web Development', 'JavaScript', 'React', 'Node.js'],
          'Experienced web developer with 5 years of experience in full-stack development.',
          true
        ]
      );
      
      console.log('Created freelancer user: freelancer@example.com / freelancer123');
    } else {
      console.log('Freelancer user already exists');
    }
    
    // Create sample job
    const jobExists = await client.query(
      'SELECT * FROM jobs WHERE title = $1',
      ['Sample Web Development Project']
    );
    
    if (jobExists.rows.length === 0) {
      // Get client id
      const clientResult = await client.query(
        'SELECT c.id FROM clients c JOIN users u ON c.user_id = u.id WHERE u.email = $1',
        ['client@example.com']
      );
      
      if (clientResult.rows.length > 0) {
        const clientId = clientResult.rows[0].id;
        
        await client.query(
          'INSERT INTO jobs (client_id, title, description, requirements, budget, status, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [
            clientId,
            'Sample Web Development Project',
            'We need a skilled developer to build a responsive website for our company.',
            'HTML, CSS, JavaScript, Responsive Design',
            1000.00,
            'open',
            'paid'
          ]
        );
        
        console.log('Created sample job');
      }
    } else {
      console.log('Sample job already exists');
    }
    
    await client.query('COMMIT');
    console.log('Default users created successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating default users:', error);
  } finally {
    client.release();
    pool.end();
  }
}

createDefaultUsers();