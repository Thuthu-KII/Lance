const db = require("better-sqlite3")("LANCE.db");

db.pragma("journal_mode=WAL"); // Better concurrency

const createJobsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientId INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    wage REAL NOT NULL,
    FOREIGN KEY (clientId) REFERENCES users(id)
  )
`).run();
// Add a new job
const addJob = db.prepare(`
    INSERT INTO jobs (clientId, title, description, wage) 
    VALUES (@clientId, @title, @description, @wage)
  `);
  
  // Find job by ID
  const findJobById = db.prepare(`
    SELECT * FROM jobs WHERE id = ?
  `);
  
  // Find all jobs for a specific client
  const findJobsByClientId = db.prepare(`
    SELECT * FROM jobs WHERE clientId = ?
  `);
  
  // Get all jobs (optional, useful for listings)
  const getAllJobs = db.prepare(`
    SELECT * FROM jobs
  `);
  module.exports = {
    addJob,
    findJobById,
    findJobsByClientId,
    getAllJobs
  };
  