/**
 * Payment model for payment-related operations
 */
const db = require('../config/database');

class Payment {
  // Find a payment by ID
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM payments WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding payment by ID:', error);
      throw error;
    }
  }
  
  // Create a new payment
  static async create(paymentData) {
    try {
      const { 
        jobId, amount, transactionId, paymentType, 
        status, paidBy, paidTo
      } = paymentData;
      
      const result = await db.query(
        `INSERT INTO payments 
         (job_id, amount, transaction_id, payment_type, status, paid_by, paid_to) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [jobId, amount, transactionId, paymentType, status || 'pending', paidBy, paidTo]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }
  
  // Update a payment
  static async update(id, paymentData) {
    try {
      const { status, transactionId, processedBy } = paymentData;
      
      // Start building the query
      let query = 'UPDATE payments SET ';
      const values = [];
      const queryParts = [];
      
      if (status) {
        queryParts.push(`status = $${values.length + 1}`);
        values.push(status);
      }
      
      if (transactionId) {
        queryParts.push(`transaction_id = $${values.length + 1}`);
        values.push(transactionId);
      }
      
      if (processedBy) {
        queryParts.push(`processed_by = $${values.length + 1}`);
        values.push(processedBy);
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
      console.error('Error updating payment:', error);
      throw error;
    }
  }
  
  // Get payment with related details
  static async getWithDetails(id) {
    try {
      const result = await db.query(`
        SELECT p.*, j.title AS job_title, 
               u_from.email AS paid_by_email,
               u_to.email AS paid_to_email,
               u_admin.email AS processed_by_email
        FROM payments p
        LEFT JOIN jobs j ON p.job_id = j.id
        LEFT JOIN users u_from ON p.paid_by = u_from.id
        LEFT JOIN users u_to ON p.paid_to = u_to.id
        LEFT JOIN users u_admin ON p.processed_by = u_admin.id
        WHERE p.id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting payment with details:', error);
      throw error;
    }
  }
  
  // Get all payments with optional filters
  static async getAll(options = {}) {
    try {
      let query = `
        SELECT p.*, j.title AS job_title, 
               u_from.email AS paid_by_email,
               u_to.email AS paid_to_email,
               u_admin.email AS processed_by_email
        FROM payments p
        LEFT JOIN jobs j ON p.job_id = j.id
        LEFT JOIN users u_from ON p.paid_by = u_from.id
        LEFT JOIN users u_to ON p.paid_to = u_to.id
        LEFT JOIN users u_admin ON p.processed_by = u_admin.id
      `;
      
      const values = [];
      const conditions = [];
      
      // Add filters
      if (options.jobId) {
        conditions.push(`p.job_id = $${values.length + 1}`);
        values.push(options.jobId);
      }
      
      if (options.paymentType) {
        conditions.push(`p.payment_type = $${values.length + 1}`);
        values.push(options.paymentType);
      }
      
      if (options.status) {
        conditions.push(`p.status = $${values.length + 1}`);
        values.push(options.status);
      }
      
      if (options.paidBy) {
        conditions.push(`p.paid_by = $${values.length + 1}`);
        values.push(options.paidBy);
      }
      
      if (options.paidTo) {
        conditions.push(`p.paid_to = $${values.length + 1}`);
        values.push(options.paidTo);
      }
      
      // Add WHERE clause if there are conditions
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Add ordering
      query += ' ORDER BY p.created_at DESC';
      
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting payments:', error);
      throw error;
    }
  }
  
  // Get pending freelancer payments
  static async getPendingFreelancerPayments() {
    return this.getAll({ 
      paymentType: 'freelancer_payment',
      status: 'pending'
    });
  }
  
  // Get user's payment history
  static async getUserPaymentHistory(userId) {
    try {
      const result = await db.query(`
        SELECT p.*, j.title AS job_title, 
               u_from.email AS paid_by_email,
               u_to.email AS paid_to_email
        FROM payments p
        LEFT JOIN jobs j ON p.job_id = j.id
        LEFT JOIN users u_from ON p.paid_by = u_from.id
        LEFT JOIN users u_to ON p.paid_to = u_to.id
        WHERE p.paid_by = $1 OR p.paid_to = $1
        ORDER BY p.created_at DESC
      `, [userId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting user payment history:', error);
      throw error;
    }
  }
  
  // Get payment statistics
  static async getStatistics() {
    try {
      const totalQuery = await db.query(`
        SELECT SUM(amount) AS total FROM payments WHERE status = $1
      `, ['completed']);
      
      const clientPaymentsQuery = await db.query(`
        SELECT SUM(amount) AS total FROM payments 
        WHERE payment_type = $1 AND status = $2
      `, ['job_posting', 'completed']);
      
      const freelancerPaymentsQuery = await db.query(`
        SELECT SUM(amount) AS total FROM payments 
        WHERE payment_type = $1 AND status = $2
      `, ['freelancer_payment', 'completed']);
      
      const pendingPaymentsQuery = await db.query(`
        SELECT SUM(amount) AS total FROM payments WHERE status = $1
      `, ['pending']);
      
      return {
        totalPayments: totalQuery.rows[0].total || 0,
        clientPayments: clientPaymentsQuery.rows[0].total || 0,
        freelancerPayments: freelancerPaymentsQuery.rows[0].total || 0,
        pendingPayments: pendingPaymentsQuery.rows[0].total || 0,
        platformFees: (clientPaymentsQuery.rows[0].total || 0) - (freelancerPaymentsQuery.rows[0].total || 0)
      };
    } catch (error) {
      console.error('Error getting payment statistics:', error);
      throw error;
    }
  }
}

module.exports = Payment;