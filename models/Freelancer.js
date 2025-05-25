/**
 * Freelancer model for freelancer-specific operations
 */
const db = require('../config/database');

class Freelancer {
  // Find a freelancer by user ID
  static async findByUserId(userId) {
    try {
      const result = await db.query('SELECT * FROM freelancers WHERE user_id = $1', [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding freelancer by user ID:', error);
      throw error;
    }
  }
  
  // Find a freelancer by ID
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM freelancers WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding freelancer by ID:', error);
      throw error;
    }
  }
  
  // Create a new freelancer profile
  static async create(freelancerData) {
    try {
      const { 
        userId, firstName, lastName, phone, address, 
        skills, experience, cvPath, clearancePath 
      } = freelancerData;
      
      const result = await db.query(
        `INSERT INTO freelancers 
         (user_id, first_name, last_name, phone, address, skills, experience, cv_path, clearance_path, is_approved) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [userId, firstName, lastName, phone, address, skills, experience, cvPath, clearancePath, false]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating freelancer profile:', error);
      throw error;
    }
  }
  
  // Update a freelancer profile
  static async update(id, freelancerData) {
    if (Object.keys(freelancerData).length === 0) {
      return await this.findById(id);
    }
    try {
      const { 
        firstName, lastName, phone, address, 
        skills, experience, cvPath, clearancePath 
      } = freelancerData;
      
      // Start building the query
      let query = 'UPDATE freelancers SET ';
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
      
      if (clearancePath) {
        queryParts.push(`clearance_path = $${values.length + 1}`);
        values.push(clearancePath);
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
      console.error('Error updating freelancer profile:', error);
      throw error;
    }
  }
  
  // Approve a freelancer
  static async approve(id) {
    try {
      const result = await db.query(
        'UPDATE freelancers SET is_approved = TRUE, updated_at = $1 WHERE id = $2 RETURNING *',
        [new Date(), id]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error approving freelancer:', error);
      throw error;
    }
  }
  
  // Get freelancer with user details
  static async getWithUserDetails(id) {
    try {
      const result = await db.query(`
        SELECT f.*, u.email, u.created_at as user_created_at
        FROM freelancers f
        JOIN users u ON f.user_id = u.id
        WHERE f.id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting freelancer with user details:', error);
      throw error;
    }
  }
  
  // Get all freelancers
  static async getAll(options = {}) {
    try {
      let query = `
        SELECT f.*, u.email, u.created_at as user_created_at
        FROM freelancers f
        JOIN users u ON f.user_id = u.id
      `;
      
      const values = [];
      
      // Add filters
      if (options.approved !== undefined) {
        query += ` WHERE f.is_approved = $${values.length + 1}`;
        values.push(options.approved);
      }
      
      // Add ordering
      query += ' ORDER BY f.created_at DESC';
      
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting freelancers:', error);
      throw error;
    }
  }
  
  // Get all pending approvals
  static async getPendingApprovals() {
    return this.getAll({ approved: false });
  }
  
  // Count all freelancers
  static async count(approved = null) {
    try {
      let query = 'SELECT COUNT(*) FROM freelancers';
      const values = [];
      
      if (approved !== null) {
        query += ' WHERE is_approved = $1';
        values.push(approved);
      }
      
      const result = await db.query(query, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting freelancers:', error);
      throw error;
    }
  }
  
  // Get freelancer's applications
  static async getApplications(freelancerId) {
    try {
      const result = await db.query(`
        SELECT ja.*, j.title, j.description, j.budget, j.deadline, j.status AS job_status, 
               c.first_name AS client_first_name, c.last_name AS client_last_name, c.company_name
        FROM job_applications ja
        INNER JOIN jobs j ON ja.job_id = j.id
        INNER JOIN clients c ON j.client_id = c.id
        WHERE ja.freelancer_id = $1
        ORDER BY ja.created_at DESC
      `, [freelancerId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting freelancer applications:', error);
      throw error;
    }
  }
  
  // Get freelancer's hired jobs
  static async getHiredJobs(freelancerId) {
    try {
      const result = await db.query(`
        SELECT j.*, c.first_name AS client_first_name, c.last_name AS client_last_name, c.company_name,
               ja.status AS application_status, ja.created_at AS application_date
        FROM jobs j
        INNER JOIN clients c ON j.client_id = c.id
        INNER JOIN job_applications ja ON j.id = ja.job_id
        WHERE ja.freelancer_id = $1 AND ja.status = 'hired'
        ORDER BY j.updated_at DESC
      `, [freelancerId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting freelancer hired jobs:', error);
      throw error;
    }
  }
}

module.exports = Freelancer;