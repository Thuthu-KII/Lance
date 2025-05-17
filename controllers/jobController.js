const db = require('../config/database');
const pdfService = require('../services/pdfService');

module.exports = {
  createJob: async (req, res) => {
    const { title, description, wage, category, duration, location } = req.body;
    const clientId = req.user.id;

    try {
      const result = await db.query(
        `INSERT INTO jobs 
         (client_id, title, description, wage, category, duration, location) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [clientId, title, description, wage, category, duration, location]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create job' });
    }
  },

  getJobs: async (req, res) => {
    try {
      let query = 'SELECT * FROM jobs WHERE status = $1';
      const params = ['active'];
      
      if (req.user.role === 'freelancer') {
        query += ' AND id NOT IN (SELECT job_id FROM transactions WHERE freelancer_id = $2)';
        params.push(req.user.id);
      }

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  },

  getJobDetails: async (req, res) => {
    try {
      const result = await db.query(
        `SELECT j.*, u.display_name as client_name 
         FROM jobs j JOIN users u ON j.client_id = u.id 
         WHERE j.id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch job details' });
    }
  },

  generateInvoice: async (req, res) => {
    const { jobId } = req.params;
    
    try {
      const jobResult = await db.query(
        `SELECT j.*, u.display_name as client_name, u.email as client_email 
         FROM jobs j JOIN users u ON j.client_id = u.id 
         WHERE j.id = $1`,
        [jobId]
      );

      if (jobResult.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const job = jobResult.rows[0];
      const invoice = await pdfService.generateInvoice(job);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice_${jobId}.pdf`);
      invoice.pipe(res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to generate invoice' });
    }
  }
};