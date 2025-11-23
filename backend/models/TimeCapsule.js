import db from '../config/database.js';

class TimeCapsule {
  // Create a new time capsule
  static create(data) {
    try {
      const stmt = db.prepare(`
        INSERT INTO time_capsules (
          user_id, message, recipient_type, recipient_email, 
          open_date, audio_file_url, video_file_url, image_file_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        data.userId || null,
        data.message,
        data.recipientType,
        data.recipientEmail || null,
        data.openDate,
        data.audioFileUrl || null,
        data.videoFileUrl || null,
        data.imageFileUrl || null
      );
      
      return {
        id: result.lastInsertRowid,
        ...data,
        created_at: new Date(),
        is_sent: false
      };
    } catch (error) {
      console.error('Error creating time capsule:', error);
      throw error;
    }
  }

  // Find all time capsules
  static findAll() {
    const stmt = db.prepare(`
      SELECT * FROM time_capsules 
      ORDER BY created_at DESC
    `);
    return stmt.all();
  }

  // Find capsules by recipient email that are ready to open
  static findReadyForRecipient(email) {
    const stmt = db.prepare(`
      SELECT * FROM time_capsules 
      WHERE recipient_email = ? 
      AND datetime(open_date) <= datetime('now')
      AND is_sent = 1
      ORDER BY open_date DESC
    `);
    return stmt.all(email);
  }

  // Find capsules by user ID
  static findByUserId(userId) {
    const stmt = db.prepare(`
      SELECT * FROM time_capsules 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(userId);
  }

  // Find capsule by ID
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM time_capsules WHERE id = ?');
    return stmt.get(id);
  }

  // Update is_sent status
  static markAsSent(id) {
    const stmt = db.prepare(`
      UPDATE time_capsules 
      SET is_sent = 1 
      WHERE id = ?
    `);
    return stmt.run(id);
  }

  // Delete capsule
  static delete(id) {
    const stmt = db.prepare('DELETE FROM time_capsules WHERE id = ?');
    return stmt.run(id);
  }

  // Get capsules ready to be sent (open_date has passed and not yet sent)
  static findReadyToSend() {
    const stmt = db.prepare(`
      SELECT * FROM time_capsules 
      WHERE datetime(open_date) <= datetime('now')
      AND is_sent = 0
      ORDER BY open_date ASC
    `);
    return stmt.all();
  }
}

export default TimeCapsule;
