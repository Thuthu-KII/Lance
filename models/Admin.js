/**
 * Admin model for admin-specific operations
 */
const db = require('../config/database');

class Admin {
  // Find an admin by user ID
  static async findByUserId(userId) {
    try {
      const result = await db.query('SELECT * FROM admins WHERE user_id = $1', [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding admin by user ID:', error);
      throw error;
    }
  }
  
  // Find an admin by ID
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM admins WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding admin by ID:', error);
      throw error;
    }
  }
  
  // Create a new admin profile
  static async create(adminData) {
    try {
      const { userId, firstName, lastName } = adminData;
      
      const result = await db.query(
        'INSERT INTO admins (user_id, first_name, last_name) VALUES ($1, $2, $3) RETURNING *',
        [userId, firstName, lastName]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating admin profile:', error);
      throw error;
    }
  }
  
  // Update an admin profile
  static async update(id, adminData) {
    try {
      const { firstName, lastName } = adminData;
      
      const result = await db.query(
        `UPDATE admins 
         SET first_name = $1, last_name = $2, updated_at = $3 
         WHERE id = $4 
         RETURNING *`,
        [firstName, lastName, new Date(), id]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating admin profile:', error);
      throw error;
    }
  }
  
  // Get all admins
  static async getAll() {
    try {
      const result = await db.query(`
        SELECT a.*, u.email, u.created_at as user_created_at
        FROM admins a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting all admins:', error);
      throw error;
    }
  }
  
  // Count all admins
  static async count() {
    try {
      const result = await db.query('SELECT COUNT(*) FROM admins');
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting admins:', error);
      throw error;
    }
  }
}

module.exports = Admin;