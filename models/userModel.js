const db = require('../config/database');

module.exports = {
  createUser: async (userData) => {
    const { googleId, email, displayName, role, phone, location, yearsExperience, industry } = userData;
    
    const result = await db.query(
      `INSERT INTO users 
       (google_id, email, display_name, role, phone, location, years_experience, industry) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [googleId, email, displayName, role, phone, location, yearsExperience, industry]
    );
    
    return result.rows[0];
  },

  findById: async (id) => {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  updateProfile: async (userId, updateData) => {
    const { phone, location, yearsExperience, industry, cvUrl } = updateData;
    
    const result = await db.query(
      `UPDATE users 
       SET phone = $1, location = $2, years_experience = $3, industry = $4, cv_url = $5 
       WHERE id = $6 
       RETURNING *`,
      [phone, location, yearsExperience, industry, cvUrl, userId]
    );
    
    return result.rows[0];
  },

  // Admin functions
  getAllUsers: async () => {
    const result = await db.query('SELECT * FROM users');
    return result.rows;
  },

  updateUserRole: async (userId, role) => {
    const result = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
      [role, userId]
    );
    return result.rows[0];
  }
};