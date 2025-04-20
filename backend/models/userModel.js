const db = require("better-sqlite3")("LANCE.db");

db.pragma("journal_mode=WAL"); // Enable Write-Ahead Logging for better concurrency
const createTables = db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        googleId TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        displayName TEXT NOT NULL
    )
`).run();
const addUser = db.prepare(`
    INSERT OR IGNORE INTO users (googleId, email, displayName) 
    VALUES (@googleId, @email, @displayName)
`); // Insert user or ignore if already exists

const findUserByGoogleId = db.prepare(`
    SELECT * FROM users WHERE googleId = ?
`); // Find user by Google ID

const findUserByEmail = db.prepare(`
    SELECT * FROM users WHERE email = ?
`); // Find user by email

const findUserById = db.prepare('SELECT * FROM users WHERE id = ?');
module.exports = { addUser, findUserByEmail, findUserByGoogleId, findUserById};
