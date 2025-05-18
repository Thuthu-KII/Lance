/**
 * JobApplication model for application-related operations
 */
const db = require('../config/database');

class JobApplication {
  // Find an application by ID
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM job_applications WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding application by ID:', error);
      throw error;
    }
  }
  
  // Find an application by job and freelancer IDs
  static async findByJobAndFreelancer(jobId, freelancerId) {
    try {
      const result = await db.query(
        'SELECT * FROM job_applications WHERE job_id = $1 AND freelancer_id = $2',
        [jobId, freelancerId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding application by job and freelancer:', error);
      throw error;
    }
  }
  
  // Create a new application
  static async create(applicationData) {
    try {
      const { jobId, freelancerId, motivation } = applicationData;
      
      // Check if freelancer has already applied
      const existingApplication = await this.findByJobAndFreelancer(jobId, freelancerId);
      if (existingApplication) {
        throw new Error('You have already applied for this job');
      }
      
      const result = await db.query(
        'INSERT INTO job_applications (job_id, freelancer_id, motivation) VALUES ($1, $2, $3) RETURNING *',
        [jobId, freelancerId, motivation]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }
  
  // Update an application
  static async update(id, applicationData) {
    try {
      const { motivation, status } = applicationData;
      
      // Start building the query
      let query = 'UPDATE job_applications SET ';
      const values = [];
      const queryParts = [];
      
      if (motivation) {
        queryParts.push(`motivation = $${values.length + 1}`);
        values.push(motivation);
      }
      
      if (status) {
        queryParts.push(`status = $${values.length + 1}`);
        values.push(status);
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
      console.error('Error updating application:', error);
      throw error;
    }
  }
  
  // Get application with job and freelancer details
  static async getWithDetails(id) {
    try {
      const result = await db.query(`
        SELECT ja.*, j.title AS job_title, j.budget, j.status AS job_status,
               f.first_name AS freelancer_first_name, f.last_name AS freelancer_last_name,
               c.first_name AS client_first_name, c.last_name AS client_last_name,
               c.company_name
        FROM job_applications ja
        INNER JOIN jobs j ON ja.job_id = j.id
        INNER JOIN freelancers f ON ja.freelancer_id = f.id
        INNER JOIN clients c ON j.client_id = c.id
        WHERE ja.id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting application with details:', error);
      throw error;
    }
  }
  
  // Get all applications for a job
  static async getByJobId(jobId) {
    try {
      const result = await db.query(`
        SELECT ja.*, f.first_name, f.last_name, f.skills, f.experience, f.cv_path
        FROM job_applications ja
        INNER JOIN freelancers f ON ja.freelancer_id = f.id
        WHERE ja.job_id = $1
        ORDER BY ja.created_at DESC
      `, [jobId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting applications by job ID:', error);
      throw error;
    }
  }
  
  // Get all applications by a freelancer
  static async getByFreelancerId(freelancerId) {
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
      console.error('Error getting applications by freelancer ID:', error);
      throw error;
    }
  }
  
  // Get hired application for a job
  static async getHiredApplication(jobId) {
    try {
      const result = await db.query(`
        SELECT ja.*, f.first_name, f.last_name, f.user_id AS freelancer_user_id
        FROM job_applications ja
        INNER JOIN freelancers f ON ja.freelancer_id = f.id
        WHERE ja.job_id = $1 AND ja.status = 'hired'
      `, [jobId]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting hired application:', error);
      throw error;
    }
  }
  
  // Count applications
  static async count(filters = {}) {
    try {
      let query = 'SELECT COUNT(*) FROM job_applications';
      const values = [];
      const conditions = [];
      
      if (filters.jobId) {
        conditions.push(`job_id = $${values.length + 1}`);
        values.push(filters.jobId);
      }
      
      if (filters.freelancerId) {
        conditions.push(`freelancer_id = $${values.length + 1}`);
        values.push(filters.freelancerId);
      }
      
      if (filters.status) {
        conditions.push(`status = $${values.length + 1}`);
        values.push(filters.status);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      const result = await db.query(query, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting applications:', error);
      throw error;
    }
  }
}

module.exports = JobApplication;