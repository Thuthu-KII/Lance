/**
 * Payment Service for processing payments
 */
const yoco = require('../config/yoco');
const db = require('../config/database');
const emailService = require('./emailService');
const { AppError } = require('../utils/errorHandler');

// Process job posting payment
exports.processJobPostingPayment = async (jobId, token, userId) => {
  try {
    // Get job details
    const jobResult = await db.query(`
      SELECT j.*, c.user_id AS client_user_id
      FROM jobs j
      INNER JOIN clients c ON j.client_id = c.id
      WHERE j.id = $1
    `, [jobId]);
    
    if (jobResult.rows.length === 0) {
      throw new AppError('Job not found', 404);
    }
    
    const job = jobResult.rows[0];
    
    // Verify client ownership
    if (job.client_user_id !== userId) {
      throw new AppError('You are not authorized to pay for this job', 403);
    }
    
    // Check if already paid
    if (job.payment_status === 'paid') {
      throw new AppError('This job has already been paid for', 400);
    }
    
    // Process payment with Yoco
    try {
      const charge = await yoco.payments.create({
        token: token,
        amountInCents: Math.round(job.budget * 100), // Convert to cents
        currency: 'ZAR',
        metadata: {
          jobId: jobId,
          userId: userId,
          paymentType: 'job_posting'
        }
      });
      
      // Update job and create payment record
      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Update job payment status
        await client.query(
          'UPDATE jobs SET payment_status = $1, status = $2, updated_at = NOW() WHERE id = $3',
          ['paid', 'open', jobId]
        );
        
        // Create payment record
        const paymentInsert = await client.query(
          'INSERT INTO payments (job_id, amount, transaction_id, payment_type, status, paid_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [jobId, job.budget, charge.id, 'job_posting', 'completed', userId]
        );
        
        await client.query('COMMIT');
        
        return {
          success: true,
          paymentId: paymentInsert.rows[0].id,
          transactionId: charge.id,
          amount: job.budget
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      throw new AppError(error.message || 'Payment processing failed', 400);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Payment service error:', error);
    throw new AppError('An error occurred during payment processing', 500);
  }
};

// Process freelancer payment
exports.processFreelancerPayment = async (paymentId, adminId) => {
  try {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get payment details
      const paymentResult = await client.query(
        'SELECT * FROM payments WHERE id = $1 AND payment_type = $2 AND status = $3',
        [paymentId, 'freelancer_payment', 'pending']
      );
      
      if (paymentResult.rows.length === 0) {
        throw new AppError('Payment not found or not eligible for processing', 404);
      }
      
      const payment = paymentResult.rows[0];
      
      // Get job and freelancer details
      const jobResult = await client.query(`
        SELECT j.*, f.first_name, f.last_name, f.user_id AS freelancer_user_id, u.email AS freelancer_email
        FROM jobs j
        INNER JOIN job_applications ja ON j.id = ja.job_id
        INNER JOIN freelancers f ON ja.freelancer_id = f.id
        INNER JOIN users u ON f.user_id = u.id
        WHERE j.id = $1 AND ja.status = 'hired'
      `, [payment.job_id]);
      
      if (jobResult.rows.length === 0) {
        throw new AppError('Related job or hired freelancer not found', 404);
      }
      
      const jobWithFreelancer = jobResult.rows[0];
      
      // Update payment status
      await client.query(
        'UPDATE payments SET status = $1, processed_by = $2, updated_at = NOW() WHERE id = $3',
        ['completed', adminId, paymentId]
      );
      
      await client.query('COMMIT');
      
      // Send email notification to freelancer
      try {
        await emailService.sendPaymentNotificationToFreelancer(
          payment,
          {
            title: jobWithFreelancer.title,
            id: jobWithFreelancer.id
          },
          {
            firstName: jobWithFreelancer.first_name,
            email: jobWithFreelancer.freelancer_email
          }
        );
      } catch (emailError) {
        console.error('Error sending payment notification email:', emailError);
        // Continue even if email fails
      }
      
      return {
        success: true,
        paymentId: payment.id,
        amount: payment.amount,
        freelancerName: `${jobWithFreelancer.first_name} ${jobWithFreelancer.last_name}`,
        freelancerEmail: jobWithFreelancer.freelancer_email
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Payment service error:', error);
    throw new AppError('Error processing freelancer payment', 500);
  }
};

// Get payment details
exports.getPaymentDetails = async (paymentId) => {
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
    `, [paymentId]);
    
    if (result.rows.length === 0) {
      throw new AppError('Payment not found', 404);
    }
    
    return result.rows[0];
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Payment service error:', error);
    throw new AppError('Error retrieving payment details', 500);
  }
};

// Get all payments for a job
exports.getJobPayments = async (jobId) => {
  try {
    const result = await db.query(`
      SELECT p.*, 
             u_from.email AS paid_by_email,
             u_to.email AS paid_to_email,
             u_admin.email AS processed_by_email
      FROM payments p
      LEFT JOIN users u_from ON p.paid_by = u_from.id
      LEFT JOIN users u_to ON p.paid_to = u_to.id
      LEFT JOIN users u_admin ON p.processed_by = u_admin.id
      WHERE p.job_id = $1
      ORDER BY p.created_at DESC
    `, [jobId]);
    
    return result.rows;
  } catch (error) {
    console.error('Payment service error:', error);
    throw new AppError('Error retrieving job payments', 500);
  }
};

// Get user's payment history
exports.getUserPaymentHistory = async (userId) => {
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
    console.error('Payment service error:', error);
    throw new AppError('Error retrieving payment history', 500);
  }
};