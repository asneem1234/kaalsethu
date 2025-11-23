import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database file in backend directory
const dbPath = path.join(__dirname, '..', 'timecapsule.db');

// Initialize database
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const initDB = () => {
  console.log('📦 Initializing SQLite database...');

  // Users table
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Time capsules table
  const createTimeCapsules = `
    CREATE TABLE IF NOT EXISTS time_capsules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT NOT NULL,
      recipient_type TEXT NOT NULL,
      recipient_email TEXT,
      open_date DATETIME NOT NULL,
      audio_file_url TEXT,
      video_file_url TEXT,
      image_file_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_sent BOOLEAN DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;

  // Community posts table
  const createCommunityPosts = `
    CREATE TABLE IF NOT EXISTS community_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      year INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;

  try {
    db.exec(createUsersTable);
    db.exec(createTimeCapsules);
    db.exec(createCommunityPosts);
    console.log('✅ SQLite database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Initialize database on import
initDB();

export default db;
