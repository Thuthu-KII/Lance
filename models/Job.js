/**
 * Job model for job-related operations
 */
const db = require('../config/database');

class Job {
  // Find a job by ID
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding job by ID:', error);
      throw error;
    }
  }
  
  // Get a job with client details
  static async getWithClientDetails(id) {
    try {
      const result = await db.query(`
        SELECT j.*, c.first_name AS client_first_name, c.last_name AS client_last_name, 
               c.company_name, c.user_id AS client_user_id
        FROM jobs j
        INNER JOIN clients c ON j.client_id = c.id
        WHERE j.id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting job with client details:', error);
      throw error;
    }
  }
  
  // Create a new job
  static async create(jobData) {
    try {
      const { 
        clientId, title, description, requirements, 
        budget, deadline, status, paymentStatus 
      } = jobData;
      
      const result = await db.query(
        `INSERT INTO jobs 
         (client_id, title, description, requirements, budget, deadline, status, payment_status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [clientId, title, description, requirements, budget, deadline, status || 'pending', paymentStatus || 'unpaid']
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }
  
  // Update a job
  static async update(id, jobData) {
    try {
      const { 
        title, description, requirements, 
        budget, deadline, status, paymentStatus 
      } = jobData;
      
      // Start building the query
      let query = 'UPDATE jobs SET ';
      const values = [];
      const queryParts = [];
      
      // Add fields if provided
      if (title) {
        queryParts.push(`title = $${values.length + 1}`);
        values.push(title);
      }
      
      if (description) {
        queryParts.push(`description = $${values.length + 1}`);
        values.push(description);
      }
      
      if (requirements !== undefined) {
        queryParts.push(`requirements = $${values.length + 1}`);
        values.push(requirements);
      }
      
      if (budget) {
        queryParts.push(`budget = $${values.length + 1}`);
        values.push(budget);
      }
      
      if (deadline !== undefined) {
        queryParts.push(`deadline = $${values.length + 1}`);
        values.push(deadline);
      }
      
      if (status) {
        queryParts.push(`status = $${values.length + 1}`);
        values.push(status);
      }
      
      if (paymentStatus) {
        queryParts.push(`payment_status = $${values.length + 1}`);
        values.push(paymentStatus);
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
      console.error('Error updating job:', error);
      throw error;
    }
  }
  
  // Delete a job
  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM jobs WHERE id = $1 RETURNING *', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }
  
  // Get all jobs with optional filters
  static async getAll(options = {}) {
    try {
      let query = `
        SELECT j.*, c.first_name, c.last_name, c.company_name
        FROM jobs j
        INNER JOIN clients c ON j.client_id = c.id
      `;
      
      const values = [];
      const conditions = [];
      
      // Add filters
      if (options.status) {
        conditions.push(`j.status = $${values.length + 1}`);
        values.push(options.status);
      }
      
      if (options.clientId) {
        conditions.push(`j.client_id = $${values.length + 1}`);
        values.push(options.clientId);
      }
      
      if (options.minBudget) {
        conditions.push(`j.budget >= $${values.length + 1}`);
        values.push(options.minBudget);
      }
      
      if (options.maxBudget) {
        conditions.push(`j.budget <= $${values.length + 1}`);
        values.push(options.maxBudget);
      }
      
      // Add WHERE clause if there are conditions
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Add ordering
      query += ' ORDER BY ' + (options.orderBy || 'j.created_at DESC');
      
      // Add limit if specified
      if (options.limit) {
        query += ` LIMIT $${values.length + 1}`;
        values.push(options.limit);
      }
      
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting jobs:', error);
      throw error;
    }
  }
  
  // Get open jobs
  static async getOpenJobs() {
    return this.getAll({ status: 'open' });
  }
  
  // Get a client's jobs
  static async getClientJobs(clientId) {
    return this.getAll({ clientId });
  }
  
  // Get job applications
  static async getApplications(jobId) {
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
      console.error('Error getting job applications:', error);
      throw error;
    }
  }
  
  // Hire a freelancer for a job
  static async hireFreelancer(jobId, applicationId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Update application status to hired
      await client.query(
        'UPDATE job_applications SET status = $1 WHERE id = $2',
        ['hired', applicationId]
      );
      
      // Update job status to in-progress
      await client.query(
        'UPDATE jobs SET status = $1 WHERE id = $2',
        ['in-progress', jobId]
      );
      
      // Create job completion record
      await client.query(
        'INSERT INTO job_completions (job_id) VALUES ($1)',
        [jobId]
      );
      
      // Reject all other applications
      await client.query(
        'UPDATE job_applications SET status = $1 WHERE job_id = $2 AND id != $3',
        ['rejected', jobId, applicationId]
      );
      
      await client.query('COMMIT');
      
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error hiring freelancer:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Mark job as complete from client side
  static async markCompleteByClient(jobId) {
    try {
      // Update job completion record
      await db.query(
        'UPDATE job_completions SET client_confirmed = true, updated_at = NOW() WHERE job_id = $1',
        [jobId]
      );
      
      // Check if both parties have confirmed
      const completionResult = await db.query(
        'SELECT * FROM job_completions WHERE job_id = $1',
        [jobId]
      );
      
      if (completionResult.rows.length > 0 && completionResult.rows[0].freelancer_confirmed) {
        // If both confirmed, mark job as complete
        await db.query(
          'UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2',
          ['completed', jobId]
        );
        
        await db.query(
          'UPDATE job_completions SET completed_at = NOW() WHERE job_id = $1',
          [jobId]
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking job as complete by client:', error);
      throw error;
    }
  }
  
  // Mark job as complete from freelancer side
  static async markCompleteByFreelancer(jobId) {
    try {
      // Update job completion record
      await db.query(
        'UPDATE job_completions SET freelancer_confirmed = true, updated_at = NOW() WHERE job_id = $1',
        [jobId]
      );
      
      // Check if both parties have confirmed
      const completionResult = await db.query(
        'SELECT * FROM job_completions WHERE job_id = $1',
        [jobId]
      );
      
      if (completionResult.rows.length > 0 && completionResult.rows[0].client_confirmed) {
        // If both confirmed, mark job as complete
        await db.query(
          'UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2',
          ['completed', jobId]
        );
        
        await db.query(
          'UPDATE job_completions SET completed_at = NOW() WHERE job_id = $1',
          [jobId]
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking job as complete by freelancer:', error);
      throw error;
    }
  }
  
  // Get job completion status
  static async getCompletionStatus(jobId) {
    try {
      const result = await db.query(
        'SELECT * FROM job_completions WHERE job_id = $1',
        [jobId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting job completion status:', error);
      throw error;
    }
  }
  
  // Count jobs by status
  static async countByStatus(status) {
    try {
      const result = await db.query(
        'SELECT COUNT(*) FROM jobs WHERE status = $1',
        [status]
      );
      
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error(`Error counting ${status} jobs:`, error);
      throw error;
    }
  }
  
  // Get monthly job statistics
  static async getMonthlyStats(months = 12) {
    try {
      const result = await db.query(`
        SELECT 
          DATE_TRUNC('month', created_at) AS month,
          COUNT(*) AS job_count
        FROM jobs
        WHERE created_at >= NOW() - INTERVAL '${months} months'
        GROUP BY month
        ORDER BY month
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting monthly job stats:', error);
      throw error;
    }
  }
}

module.exports = Job;