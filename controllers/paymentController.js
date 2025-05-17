const db = require('../config/database');
const paymentService = require('../services/paymentService');

module.exports = {
  initiatePayment: async (req, res) => {
    const { jobId } = req.params;
    
    try {
      // Verify job exists and belongs to the client
      const jobResult = await db.query(
        'SELECT * FROM jobs WHERE id = $1 AND client_id = $2',
        [jobId, req.user.id]
      );

      if (jobResult.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const job = jobResult.rows[0];
      const callbackUrl = `${process.env.BASE_URL}/payments/callback`;
      
      const payment = await paymentService.createPayment(
        job.id,
        job.wage,
        callbackUrl
      );

      res.json({ paymentUrl: payment.url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to initiate payment' });
    }
  },

  paymentCallback: async (req, res) => {
    const { status, id } = req.query;
    
    try {
      if (status !== 'success') {
        return res.redirect('/payments/failed');
      }

      const verified = await paymentService.verifyPayment(id);
      if (!verified) {
        return res.redirect('/payments/failed');
      }

      // Get job ID from payment metadata
      const paymentDetails = await paymentService.getPaymentDetails(id);
      const jobId = paymentDetails.metadata.jobId;

      // Create transaction record
      await db.transaction(async (client) => {
        const jobResult = await client.query(
          'SELECT client_id, wage FROM jobs WHERE id = $1 FOR UPDATE',
          [jobId]
        );

        if (jobResult.rows.length === 0) {
          throw new Error('Job not found');
        }

        const job = jobResult.rows[0];

        await client.query(
          `INSERT INTO transactions 
           (job_id, client_id, freelancer_id, amount, status, yoco_transaction_id) 
           VALUES ($1, $2, $3, $4, 'pending', $5)`,
          [jobId, job.client_id, req.user.id, job.wage, id]
        );

        await client.query(
          'UPDATE jobs SET status = $1 WHERE id = $2',
          ['active', jobId]
        );
      });

      res.redirect('/payments/success');
    } catch (err) {
      console.error(err);
      res.redirect('/payments/failed');
    }
  },

  completeJob: async (req, res) => {
    const { jobId } = req.params;
    
    try {
      await db.transaction(async (client) => {
        // Verify job is complete and belongs to the freelancer
        const jobResult = await client.query(
          `SELECT j.id, t.freelancer_id, t.amount 
           FROM jobs j 
           JOIN transactions t ON j.id = t.job_id 
           WHERE j.id = $1 AND t.freelancer_id = $2 AND j.status = 'active' 
           FOR UPDATE`,
          [jobId, req.user.id]
        );

        if (jobResult.rows.length === 0) {
          throw new Error('Job not found or not eligible for completion');
        }

        const job = jobResult.rows[0];

        // Mark job as complete
        await client.query(
          'UPDATE jobs SET status = $1 WHERE id = $2',
          ['completed', jobId]
        );

        // Release payment to freelancer
        await client.query(
          `UPDATE transactions 
           SET status = 'completed', completed_at = NOW() 
           WHERE job_id = $1`,
          [jobId]
        );
      });

      res.json({ message: 'Job marked as completed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to complete job' });
    }
  }
};