/**
 * Report model for issue reporting
 */
const db = require('../config/database');

class Report {
  // Find a report by ID
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM reports WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding report by ID:', error);
      throw error;
    }
  }
  
  // Create a new report
  static async create(reportData) {
    try {
      const { 
        reportedBy, reportedUser, jobId, issue 
      } = reportData;
      
      const result = await db.query(
        `INSERT INTO reports 
         (reported_by, reported_user, job_id, issue, status) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [reportedBy, reportedUser, jobId, issue, 'pending']
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }
  
  // Update a report
  static async update(id, reportData) {
    try {
      const { status, adminNotes } = reportData;
      
      // Start building the query
      let query = 'UPDATE reports SET ';
      const values = [];
      const queryParts = [];
      
      if (status) {
        queryParts.push(`status = $${values.length + 1}`);
        values.push(status);
      }
      
      if (adminNotes !== undefined) {
        queryParts.push(`admin_notes = $${values.length + 1}`);
        values.push(adminNotes);
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
      console.error('Error updating report:', error);
      throw error;
    }
  }
  
  // Get report with user and job details
  static async getWithDetails(id) {
    try {
      const result = await db.query(`
        SELECT r.*, 
               u_reporter.email AS reporter_email,
               u_reported.email AS reported_email,
               j.title AS job_title, j.id AS job_id
        FROM reports r
        LEFT JOIN users u_reporter ON r.reported_by = u_reporter.id
        LEFT JOIN users u_reported ON r.reported_user = u_reported.id
        LEFT JOIN jobs j ON r.job_id = j.id
        WHERE r.id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting report with details:', error);
      throw error;
    }
  }
  
  // Get all reports with optional filters
  static async getAll(options = {}) {
    try {
      let query = `
        SELECT r.*, 
               u_reporter.email AS reporter_email,
               u_reported.email AS reported_email,
               j.title AS job_title
        FROM reports r
        LEFT JOIN users u_reporter ON r.reported_by = u_reporter.id
        LEFT JOIN users u_reported ON r.reported_user = u_reported.id
        LEFT JOIN jobs j ON r.job_id = j.id
      `;
      
      const values = [];
      const conditions = [];
      
      // Add filters
      if (options.status) {
        conditions.push(`r.status = $${values.length + 1}`);
        values.push(options.status);
      }
      
      if (options.reportedBy) {
        conditions.push(`r.reported_by = $${values.length + 1}`);
        values.push(options.reportedBy);
      }
      
      if (options.reportedUser) {
        conditions.push(`r.reported_user = $${values.length + 1}`);
        values.push(options.reportedUser);
      }
      
      if (options.jobId) {
        conditions.push(`r.job_id = $${values.length + 1}`);
        values.push(options.jobId);
      }
      
      // Add WHERE clause if there are conditions
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Add ordering
      if (options.orderByStatus) {
        query += ` ORDER BY 
          CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END,
          r.created_at DESC`;
      } else {
        query += ' ORDER BY r.created_at DESC';
      }
      
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting reports:', error);
      throw error;
    }
  }
  
  // Get pending reports
  static async getPendingReports() {
    return this.getAll({ 
      status: 'pending',
      orderByStatus: true
    });
  }
  
  // Count reports by status
  static async countByStatus(status) {
    try {
      const result = await db.query(
        'SELECT COUNT(*) FROM reports WHERE status = $1',
        [status]
      );
      
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error(`Error counting ${status} reports:`, error);
      throw error;
    }
  }
}

module.exports = Report;