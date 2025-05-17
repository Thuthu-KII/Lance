const db = require("better-sqlite3")("LANCE.db");

db.pragma("journal_mode=WAL"); // Enable Write-Ahead Logging for better concurrency
const createTables = db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        googleId TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL
    )
`).run();
const addUser = db.prepare(`
    INSERT OR IGNORE INTO users (googleId, role) 
    VALUES (@googleId, @role)
`); // Insert user or ignore if already exists

const findUserByGoogleId = db.prepare(`
    SELECT * FROM users WHERE googleId = ? AND role = ?
`); // Find user by Google ID


const findUserById = db.prepare('SELECT * FROM users WHERE id = ?');
module.exports = { addUser, findUserByGoogleId, findUserById};
