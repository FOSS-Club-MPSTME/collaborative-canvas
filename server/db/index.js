const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { initializeSchema } = require('./schema');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/canvas.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath, { verbose: null });

// Initialize database schema
initializeSchema(db);

module.exports = db;
