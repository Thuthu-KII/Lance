const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function initializeDatabase() {
  try {
    // Create database if not exists
    await pool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created successfully`);
    
    // Connect to the new database
    const dbPool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    // Create tables
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'freelancer', 'admin')),
        is_admin BOOLEAN DEFAULT FALSE,
        verified BOOLEAN DEFAULT FALSE,
        phone VARCHAR(20),
        location VARCHAR(100),
        years_experience INTEGER,
        industry VARCHAR(100),
        cv_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        wage DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        duration VARCHAR(50),
        location VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ... (include all other table creation queries from the schema)

    // Create admin user
    await dbPool.query(`
      INSERT INTO users (email, display_name, role, is_admin) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (email) DO NOTHING`,
      ['admin@lancer.com', 'Admin User', 'admin', true]
    );

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization failed:', err);
  } finally {
    await pool.end();
    process.exit();
  }
}

initializeDatabase();