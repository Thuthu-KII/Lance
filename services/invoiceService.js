/**
 * Invoice Service for generating and managing invoices
 */
const { generateCsv, saveCsvToFile } = require('../utils/csvGenerator');
const db = require('../config/database');

// Generate invoice for a job
exports.generateJobInvoice = async (jobId, userId, userRole) => {
  try {
    // Get job details with client information
    let jobResult;
    
    if (userRole === 'admin') {
      jobResult = await db.query(`
        SELECT j.*, c.first_name AS client_first_name, c.last_name AS client_last_name, 
               c.company_name, c.phone AS client_phone, c.address AS client_address,
               u.email AS client_email
        FROM jobs j
        INNER JOIN clients c ON j.client_id = c.id
        INNER JOIN users u ON c.user_id = u.id
        WHERE j.id = $1
      `, [jobId]);
    } else if (userRole === 'client') {
      jobResult = await db.query(`
        SELECT j.*, c.first_name AS client_first_name, c.last_name AS client_last_name, 
               c.company_name, c.phone AS client_phone, c.address AS client_address,
               u.email AS client_email
        FROM jobs j
        INNER JOIN clients c ON j.client_id = c.id
        INNER JOIN users u ON c.user_id = u.id
        WHERE j.id = $1 AND c.user_id = $2
      `, [jobId, userId]);
    } else { // freelancer
      jobResult = await db.query(`
        SELECT j.*, c.first_name AS client_first_name, c.last_name AS client_last_name, 
               c.company_name, c.phone AS client_phone, c.address AS client_address,
               u.email AS client_email
        FROM jobs j
        INNER JOIN clients c ON j.client_id = c.id
        INNER JOIN users u ON c.user_id = u.id
        INNER JOIN job_applications ja ON j.id = ja.job_id
        INNER JOIN freelancers f ON ja.freelancer_id = f.id
        WHERE j.id = $1 AND f.user_id = $2 AND ja.status = 'hired'
      `, [jobId, userId]);
    }
    
    if (jobResult.rows.length === 0) {
      throw new Error('Job not found or you are not authorized to access this invoice');
    }
    
    const job = jobResult.rows[0];
    
    // Get hired freelancer info
    const freelancerResult = await db.query(`
      SELECT f.first_name, f.last_name, f.phone, f.address, u.email
      FROM freelancers f
      INNER JOIN users u ON f.user_id = u.id
      INNER JOIN job_applications ja ON f.id = ja.freelancer_id
      WHERE ja.job_id = $1 AND ja.status = 'hired'
    `, [jobId]);
    
    let freelancer = null;
    if (freelancerResult.rows.length > 0) {
      freelancer = freelancerResult.rows[0];
    }
    
    // Record invoice in database
    const invoiceNumber = `INV-${job.id}-${Date.now().toString().slice(-6)}`;
    
    await db.query(`
      INSERT INTO invoices (invoice_number, job_id, amount, client_id, freelancer_id, generated_by, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      invoiceNumber,
      job.id,
      job.budget,
      job.client_id,
      freelancer ? freelancerResult.rows[0].id : null,
      userId,
      'generated'
    ]);
    
    // Generate CSV content
    const csvData = generateCsv(job, freelancer);
    
    return {
      invoiceNumber,
      csvData,
      job,
      freelancer
    };
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

// Get invoice by number
exports.getInvoiceByNumber = async (invoiceNumber) => {
  try {
    const result = await db.query(`
      SELECT i.*, j.title AS job_title, j.budget,
             c.first_name AS client_first_name, c.last_name AS client_last_name,
             f.first_name AS freelancer_first_name, f.last_name AS freelancer_last_name
      FROM invoices i
      INNER JOIN jobs j ON i.job_id = j.id
      INNER JOIN clients c ON i.client_id = c.id
      LEFT JOIN freelancers f ON i.freelancer_id = f.id
      WHERE i.invoice_number = $1
    `, [invoiceNumber]);
    
    if (result.rows.length === 0) {
      throw new Error('Invoice not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

// Get all invoices for a user
exports.getUserInvoices = async (userId, userRole) => {
  try {
    let query;
    
    if (userRole === 'admin') {
      query = `
        SELECT i.*, j.title AS job_title, j.budget,
               c.first_name AS client_first_name, c.last_name AS client_last_name,
               f.first_name AS freelancer_first_name, f.last_name AS freelancer_last_name
        FROM invoices i
        INNER JOIN jobs j ON i.job_id = j.id
        INNER JOIN clients c ON i.client_id = c.id
        LEFT JOIN freelancers f ON i.freelancer_id = f.id
        ORDER BY i.created_at DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } else if (userRole === 'client') {
      query = `
        SELECT i.*, j.title AS job_title, j.budget,
               c.first_name AS client_first_name, c.last_name AS client_last_name,
               f.first_name AS freelancer_first_name, f.last_name AS freelancer_last_name
        FROM invoices i
        INNER JOIN jobs j ON i.job_id = j.id
        INNER JOIN clients c ON i.client_id = c.id
        LEFT JOIN freelancers f ON i.freelancer_id = f.id
        WHERE c.user_id = $1
        ORDER BY i.created_at DESC
      `;
      
      const result = await db.query(query, [userId]);
      return result.rows;
    } else { // freelancer
      query = `
        SELECT i.*, j.title AS job_title, j.budget,
               c.first_name AS client_first_name, c.last_name AS client_last_name,
               f.first_name AS freelancer_first_name, f.last_name AS freelancer_last_name
        FROM invoices i
        INNER JOIN jobs j ON i.job_id = j.id
        INNER JOIN clients c ON i.client_id = c.id
        INNER JOIN freelancers f ON i.freelancer_id = f.id
        WHERE f.user_id = $1
        ORDER BY i.created_at DESC
      `;
      
      const result = await db.query(query, [userId]);
      return result.rows;
    }
  } catch (error) {
    console.error('Error fetching user invoices:', error);
    throw error;
  }
};