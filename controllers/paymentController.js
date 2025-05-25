const db = require('../config/database');
const yoco = require('../config/yoco');

// Client: Get payment page for job
exports.getJobPaymentPage = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Verify job ownership
    const jobResult = await db.query(
      'SELECT * FROM jobs WHERE id = $1 AND client_id = $2',
      [id, clientId]
    );
    
    if (jobResult.rows.length === 0) {
      req.flash('error_msg', 'Job not found or you are not authorized');
      return res.redirect('/client/jobs');
    }
    
    // Check if already paid
    if (jobResult.rows[0].payment_status === 'paid') {
      req.flash('success_msg', 'Job has already been paid for');
      return res.redirect('/client/jobs');
    }
    
    res.render('client/payment', {
      job: jobResult.rows[0],
      yocoPublicKey: process.env.YOCO_PUBLIC_KEY,
      user: req.user
    });
  } catch (error) {
    console.error('Error loading payment page:', error);
    req.flash('error_msg', 'Error loading payment page');
    res.redirect('/client/jobs');
  }
};

// Client: Process job payment
exports.postJobPayment = async (req, res) => {
  try {
    const { token } = req.body;
    const jobId = req.params.id;
    
    // Add detailed logging
    console.log(`Processing payment for job ${jobId} with token ${token}`);
    
    // Your Yoco API call
    const result = await yoco.charge({
      token: token,
      amountInCents: amount,
      currency: 'ZAR',
      // other required parameters
    });
    
    console.log('Yoco API response:', result);
    
    // Rest of your processing code
    
    res.json({ success: true });
  } catch (error) {
    // Detailed error logging
    console.error('Payment processing error:', error);
    
    // Send back more specific error message if possible
    res.json({ 
      success: false, 
      message: 'We are currently experiencing issues, please retry at a later time.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Process freelancer payment (after job completion)
exports.adminProcessFreelancerPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const client = await db.getClient();
    await client.query('BEGIN');
    
    // Get payment details
    const paymentResult = await client.query(
      'SELECT * FROM payments WHERE id = $1 AND payment_type = $2 AND status = $3',
      [paymentId, 'freelancer_payment', 'pending']
    );
    
    if (paymentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      req.flash('error_msg', 'Payment not found or not eligible for processing');
      return res.redirect('/admin/payments');
    }
    
    const payment = paymentResult.rows[0];
    
    // Update payment status
    await client.query(
      'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
      ['completed', paymentId]
    );
    
    await client.query('COMMIT');
    client.release();
    
    req.flash('success_msg', 'Freelancer payment processed successfully');
    res.redirect('/admin/payments');
  } catch (error) {
    console.error('Error processing freelancer payment:', error);
    req.flash('error_msg', 'Error processing freelancer payment');
    res.redirect('/admin/payments');
  }
};

// Admin: Get all payments
exports.adminGetAllPayments = async (req, res) => {
  try {
    // Get all payments with job and user details
    const paymentsResult = await db.query(`
      SELECT p.*, j.title AS job_title, 
             u_from.email AS paid_by_email,
             u_to.email AS paid_to_email
      FROM payments p
      LEFT JOIN jobs j ON p.job_id = j.id
      LEFT JOIN users u_from ON p.paid_by = u_from.id
      LEFT JOIN users u_to ON p.paid_to = u_to.id
      ORDER BY p.created_at DESC
    `);
    
    res.render('admin/payments', {
      payments: paymentsResult.rows,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    req.flash('error_msg', 'Error fetching payments');
    res.redirect('/admin/dashboard');
  }
};