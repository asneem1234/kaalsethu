import db from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // Create a new user
  static create(name, email, password) {
    try {
      // Hash password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const stmt = db.prepare(`
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
      `);

      const result = stmt.run(name, email, hashedPassword);
      
      return {
        id: result.lastInsertRowid,
        name,
        email,
        created_at: new Date()
      };
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Find user by email
  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  // Find user by ID
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  // Compare password
  static comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compareSync(candidatePassword, hashedPassword);
  }

  // Get all users (for admin purposes)
  static findAll() {
    const stmt = db.prepare('SELECT id, name, email, created_at FROM users');
    return stmt.all();
  }

  // Update user
  static update(id, updates) {
    const fields = [];
    const values = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.password) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(updates.password, salt);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const stmt = db.prepare(`
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `);

    return stmt.run(...values);
  }

  // Delete user
  static delete(id) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  }
}

export default User;
