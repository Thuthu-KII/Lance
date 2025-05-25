/**
 * Client model for client-specific operations
 */
const db = require('../config/database');

class Client {
  // Find a client by user ID
  static async findByUserId(userId) {
    try {
      const result = await db.query('SELECT * FROM clients WHERE user_id = $1', [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding client by user ID:', error);
      throw error;
    }
  }
  
  // Find a client by ID
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding client by ID:', error);
      throw error;
    }
  }
  
  // Create a new client profile
  static async create(clientData) {
    try {
      const { 
        userId, firstName, lastName, companyName, 
        phone, address, skills, experience, cvPath 
      } = clientData;
      
      const result = await db.query(
        `INSERT INTO clients 
         (user_id, first_name, last_name, company_name, phone, address, skills, experience, cv_path) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [userId, firstName, lastName, companyName, phone, address, skills, experience, cvPath]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating client profile:', error);
      throw error;
    }
  }
  
  // Update a client profile
  static async update(id, clientData) {
    try {
      const { 
        firstName, lastName, companyName, 
        phone, address, skills, experience, cvPath 
      } = clientData;
      
      // Start building the query
      let query = 'UPDATE clients SET ';
      const values = [];
      const queryParts = [];
      
      // Add fields if provided
      if (firstName) {
        queryParts.push(`first_name = $${values.length + 1}`);
        values.push(firstName);
      }
      
      if (lastName) {
        queryParts.push(`last_name = $${values.length + 1}`);
        values.push(lastName);
      }
      
      if (companyName !== undefined) {
        queryParts.push(`company_name = $${values.length + 1}`);
        values.push(companyName);
      }
      
      if (phone !== undefined) {
        queryParts.push(`phone = $${values.length + 1}`);
        values.push(phone);
      }
      
      if (address !== undefined) {
        queryParts.push(`address = $${values.length + 1}`);
        values.push(address);
      }
      
      if (skills) {
        queryParts.push(`skills = $${values.length + 1}`);
        values.push(skills);
      }
      
      if (experience !== undefined) {
        queryParts.push(`experience = $${values.length + 1}`);
        values.push(experience);
      }
      
      if (cvPath) {
        queryParts.push(`cv_path = $${values.length + 1}`);
        values.push(cvPath);
      }
      
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
      console.error('Error updating client profile:', error);
      throw error;
    }
  }
  
  // Get a client with user details
  static async getWithUserDetails(id) {
    try {
      const result = await db.query(`
        SELECT c.*, u.email, u.created_at as user_created_at
        FROM clients c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting client with user details:', error);
      throw error;
    }
  }
  
  // Get all clients
  static async getAll() {
    try {
      const result = await db.query(`
        SELECT c.*, u.email, u.created_at as user_created_at
        FROM clients c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting all clients:', error);
      throw error;
    }
  }
  
  // Count all clients
  static async count() {
    try {
      const result = await db.query('SELECT COUNT(*) FROM clients');
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting clients:', error);
      throw error;
    }
  }
  
  // Get client's jobs
  static async getJobs(clientId) {
    try {
      const result = await db.query(`
        SELECT * FROM jobs
        WHERE client_id = $1
        ORDER BY created_at DESC
      `, [clientId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting client jobs:', error);
      throw error;
    }
  }
}

module.exports = Client;