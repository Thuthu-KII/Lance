-- Database schema for FreelanceHub platform

-- Clear tables if they exist (for development purposes)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS job_completions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS freelancers CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (authentication and role)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  role VARCHAR(20) NOT NULL,
  google_id VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clients table (client-specific profile data)
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company_name VARCHAR(200),
  phone VARCHAR(20),
  address TEXT,
  skills TEXT[],
  experience TEXT,
  cv_path VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Freelancers table (freelancer-specific profile data)
CREATE TABLE freelancers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  skills TEXT[],
  experience TEXT,
  cv_path VARCHAR(255),
  clearance_path VARCHAR(255),
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admins table (admin-specific profile data)
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table (job listings)
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  budget DECIMAL(10, 2) NOT NULL,
  deadline DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, open, in-progress, completed, cancelled
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job applications table (freelancer applications to jobs)
CREATE TABLE job_applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id INTEGER REFERENCES freelancers(id) ON DELETE CASCADE,
  motivation TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, hired, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, freelancer_id)
);

-- Payments table (payment records)
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_id VARCHAR(255),
  payment_type VARCHAR(20) NOT NULL, -- job_posting, freelancer_payment
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  paid_by INTEGER REFERENCES users(id),
  paid_to INTEGER REFERENCES users(id),
  processed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job completions table (completion status tracking)
CREATE TABLE job_completions (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  client_confirmed BOOLEAN DEFAULT FALSE,
  freelancer_confirmed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports table (issue reporting)
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  reported_by INTEGER REFERENCES users(id),
  reported_user INTEGER REFERENCES users(id),
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  issue TEXT NOT NULL,
  admin_notes TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, resolved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table (invoice records)
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  client_id INTEGER REFERENCES clients(id),
  freelancer_id INTEGER REFERENCES freelancers(id),
  generated_by INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'generated', -- generated, sent, paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create initial admin user
INSERT INTO users (email, password, role) 
VALUES ('admin@example.com', '$2a$10$Nl12xLAjHM6aXnNSbX/PgucjYjbqzHJpj2CrCQQFRPKwLmxTUPNby', 'admin');
-- Password is 'admin123' hashed with bcrypt

-- Insert admin profile for the initial admin user
INSERT INTO admins (user_id, first_name, last_name)
VALUES (1, 'System', 'Administrator');

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_freelancer_id ON job_applications(freelancer_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_payments_job_id ON payments(job_id);
CREATE INDEX idx_reports_status ON reports(status);