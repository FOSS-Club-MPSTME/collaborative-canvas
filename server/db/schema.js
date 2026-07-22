/**
 * SQLite Database Schema Definitions
 */

const CREATE_PAINTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS paintings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  artist TEXT,
  image_path TEXT,
  sequence_order INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'active', 'completed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

const CREATE_FRAMES_TABLE = `
CREATE TABLE IF NOT EXISTS frames (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  painting_id INTEGER NOT NULL,
  frame_number INTEGER NOT NULL CHECK(frame_number BETWEEN 1 AND 6),
  guide_data TEXT NOT NULL,
  pixel_grid TEXT,
  status TEXT NOT NULL DEFAULT 'unclaimed' CHECK(status IN ('unclaimed', 'in_progress', 'locked')),
  owner_name TEXT,
  owner_avatar TEXT,
  locked_at DATETIME,
  FOREIGN KEY (painting_id) REFERENCES paintings(id) ON DELETE CASCADE,
  UNIQUE(painting_id, frame_number)
);
`;

const CREATE_SESSIONS_TABLE = `
CREATE TABLE IF NOT EXISTS sessions (
  tablet_id TEXT PRIMARY KEY CHECK(tablet_id IN ('A', 'B')),
  current_painting_id INTEGER,
  current_frame_id INTEGER,
  participant_name TEXT,
  participant_avatar TEXT,
  started_at DATETIME,
  FOREIGN KEY (current_painting_id) REFERENCES paintings(id),
  FOREIGN KEY (current_frame_id) REFERENCES frames(id)
);
`;

function initializeSchema(db) {
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(CREATE_PAINTINGS_TABLE);
  db.exec(CREATE_FRAMES_TABLE);
  db.exec(CREATE_SESSIONS_TABLE);
  console.log('Database schema initialized successfully.');
}

module.exports = {
  initializeSchema
};
