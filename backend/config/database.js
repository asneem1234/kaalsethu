// Import the better-sqlite3 library - this provides fast, synchronous SQLite database access for Node.js
import Database from 'better-sqlite3';

// Import path module - used to construct file paths in a cross-platform way (works on Windows, Mac, Linux)
import path from 'path';

// Import fileURLToPath - needed to convert ES module URLs to file paths (ES modules don't have __dirname by default)
import { fileURLToPath } from 'url';

// Get the current file's path - converts the special import.meta.url to an actual file path
const __filename = fileURLToPath(import.meta.url);

// Get the directory containing this file - extracts just the folder path from the full file path
const __dirname = path.dirname(__filename);

// Create the path where the database file will be stored
// path.join combines folder names safely: __dirname (current folder) + '..' (go up one level) + 'timecapsule.db' (database filename)
// This places the database file at backend/timecapsule.db
const dbPath = path.join(__dirname, '..', 'timecapsule.db');

// Initialize the SQLite database connection
// new Database() creates/opens the database file at dbPath
// { verbose: console.log } logs all SQL queries to the console for debugging purposes
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign key constraints in SQLite
// By default, SQLite ignores foreign keys - this turns them on
// Foreign keys ensure data integrity (e.g., can't delete a user if they have time capsules)
db.pragma('foreign_keys = ON');

// Define the function that creates all database tables
// This runs when the server starts to ensure tables exist before any data operations
const initDB = () => {
  // Log a message to the console to show database initialization is starting
  console.log('📦 Initializing SQLite database...');

  // SQL command to create the users table
  // This stores all user account information
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,           -- Unique user ID, automatically increments (1, 2, 3...)
      name TEXT NOT NULL,                             -- User's full name, required (NOT NULL means must provide a value)
      email TEXT UNIQUE NOT NULL,                     -- User's email, must be unique (no duplicate accounts) and required
      password TEXT NOT NULL,                         -- Hashed password for authentication, required
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- When the account was created, automatically set to current time
    )
  `;

  // SQL command to create the time_capsules table
  // This stores all the time capsules users create (messages to be opened in the future)
  const createTimeCapsules = `
    CREATE TABLE IF NOT EXISTS time_capsules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,           -- Unique capsule ID
      user_id INTEGER,                                -- Which user created this capsule (links to users table)
      message TEXT NOT NULL,                          -- The text message inside the capsule, required
      recipient_type TEXT NOT NULL,                   -- Who will receive it (e.g., "self", "friend", "public"), required
      recipient_email TEXT,                           -- Email of the recipient (if sending to someone else), optional
      open_date DATETIME NOT NULL,                    -- When the capsule should be opened/sent, required
      audio_file_url TEXT,                            -- URL/path to audio recording attached to capsule, optional
      video_file_url TEXT,                            -- URL/path to video attached to capsule, optional
      image_file_url TEXT,                            -- URL/path to image attached to capsule, optional
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- When the capsule was created, automatically set
      is_sent BOOLEAN DEFAULT 0,                      -- Whether capsule has been sent/opened (0=no, 1=yes), defaults to no
      FOREIGN KEY (user_id) REFERENCES users(id)      -- Links user_id to the users table's id (ensures user exists)
    )
  `;

  // SQL command to create the community_posts table
  // This stores posts users make about specific decades/years (like a social feed for each era)
  const createCommunityPosts = `
    CREATE TABLE IF NOT EXISTS community_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,           -- Unique post ID
      user_id INTEGER,                                -- Which user made this post (links to users table)
      year INTEGER NOT NULL,                          -- Which year/decade this post is about (e.g., 1980, 1990), required
      content TEXT NOT NULL,                          -- The actual post content/text, required
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- When the post was created, automatically set
      FOREIGN KEY (user_id) REFERENCES users(id)      -- Links user_id to the users table (ensures user exists)
    )
  `;

  // Try to execute the table creation commands, catch any errors that occur
  try {
    // Execute the SQL to create users table (if it doesn't already exist)
    db.exec(createUsersTable);
    
    // Execute the SQL to create time_capsules table (if it doesn't already exist)
    db.exec(createTimeCapsules);
    
    // Execute the SQL to create community_posts table (if it doesn't already exist)
    db.exec(createCommunityPosts);
    
    // Log success message to console
    console.log('✅ SQLite database initialized successfully');
  } catch (error) {
    // If any error occurs during table creation, log it to console
    console.error('❌ Error initializing database:', error);
    
    // Re-throw the error so the application knows initialization failed and can't continue
    throw error;
  }
};

// Call the initialization function immediately when this file is imported
// This ensures tables are created before any other code tries to use the database
initDB();

// Export the database connection so other files can import and use it
// Other parts of the app will do: import db from './config/database.js'
export default db;
