/**
 * User model for authentication and role management
 */
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Find a user by ID
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }
  
  // Find a user by email
  static async findByEmail(email) {
    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }
  
  // Find a user by Google ID
  static async findByGoogleId(googleId) {
    try {
      const result = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by Google ID:', error);
      throw error;
    }
  }
  
  // Create a new user
  static async create(userData) {
    try {
      const { email, password, role, googleId } = userData;
      
      // Check if email already exists
      const emailCheck = await this.findByEmail(email);
      if (emailCheck) {
        throw new Error('Email already registered');
      }
      
      // Hash password if provided
      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }
      
      // Insert user
      const result = await db.query(
        'INSERT INTO users (email, password, role, google_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, hashedPassword, role, googleId || null]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  // Update a user
  static async update(id, userData) {
    try {
      const { email, password, googleId } = userData;
      
      // Start building the query
      let query = 'UPDATE users SET ';
      const values = [];
      const queryParts = [];
      
      // Add email if provided
      if (email) {
        queryParts.push(`email = $${values.length + 1}`);
        values.push(email);
      }
      
      // Add password if provided (and hash it)
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        queryParts.push(`password = $${values.length + 1}`);
        values.push(hashedPassword);
      }
      
      // Add Google ID if provided
      if (googleId) {
        queryParts.push(`google_id = $${values.length + 1}`);
        values.push(googleId);
      };
      // Add updated_at timestamp
      queryParts.push(`updated_at = $${values.length + 1}`);
      values.push(new Date());
      
      // Complete the query
      if (queryParts.length === 0) {
        return await this.findById(id); // Nothing to update
      }
      
      query += queryParts.join(', ');
      query += ` WHERE id = $${values.length + 1} RETURNING *`;
      values.push(id);
      
      // Execute the query
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  // Delete a user
  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  
  // Compare password for login
  static async comparePassword(providedPassword, storedPassword) {
    try {
      return await bcrypt.compare(providedPassword, storedPassword);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      throw error;
    }
  }
  
  // Update last login time
  static async updateLastLogin(id) {
    try {
      await db.query(
        'UPDATE users SET last_login = $1 WHERE id = $2',
        [new Date(), id]
      );
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw - this is not critical
    }
  }
  
  // Count users by role
  static async countByRole(role) {
    try {
      const result = await db.query('SELECT COUNT(*) FROM users WHERE role = $1', [role]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error(`Error counting ${role} users:`, error);
      throw error;
    }
  }
  
  // Get all users with profile information
  static async getAllWithProfiles() {
    try {
      // Complex query to get users with their role-specific profile data
      const result = await db.query(`
        SELECT u.id, u.email, u.role, u.created_at,
               CASE
                 WHEN u.role = 'client' THEN (SELECT c.first_name || ' ' || c.last_name FROM clients c WHERE c.user_id = u.id)
                 WHEN u.role = 'freelancer' THEN (SELECT f.first_name || ' ' || f.last_name FROM freelancers f WHERE f.user_id = u.id)
                 WHEN u.role = 'admin' THEN (SELECT a.first_name || ' ' || a.last_name FROM admins a WHERE a.user_id = u.id)
               END as full_name,
               CASE
                 WHEN u.role = 'freelancer' THEN (SELECT f.is_approved FROM freelancers f WHERE f.user_id = u.id)
                 ELSE true
               END as is_approved
        FROM users u
        ORDER BY u.created_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting all users with profiles:', error);
      throw error;
    }
  }
  
  // Get user with profile data
  static async getWithProfile(id) {
    try {
      // First get the user
      const user = await this.findById(id);
      if (!user) return null;
      
      let profile = null;
      
      // Get role-specific profile data
      if (user.role === 'client') {
        const clientResult = await db.query('SELECT * FROM clients WHERE user_id = $1', [id]);
        if (clientResult.rows.length > 0) {
          profile = clientResult.rows[0];
        }
      } else if (user.role === 'freelancer') {
        const freelancerResult = await db.query('SELECT * FROM freelancers WHERE user_id = $1', [id]);
        if (freelancerResult.rows.length > 0) {
          profile = freelancerResult.rows[0];
        }
      } else if (user.role === 'admin') {
        const adminResult = await db.query('SELECT * FROM admins WHERE user_id = $1', [id]);
        if (adminResult.rows.length > 0) {
          profile = adminResult.rows[0];
        }
      }
      
      return { ...user, profile };
    } catch (error) {
      console.error('Error getting user with profile:', error);
      throw error;
    }
  }
}

module.exports = User;