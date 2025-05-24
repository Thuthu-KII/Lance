const db = require('../config/database');

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    // Get all jobs and join with client info
    const jobsResult = await db.query(`
      SELECT j.*, c.first_name, c.last_name, c.company_name
      FROM jobs j
      INNER JOIN clients c ON j.client_id = c.id
      WHERE j.status = 'open'
      ORDER BY j.created_at DESC
    `);
    
    res.render('freelancer/jobs', {
      jobs: jobsResult.rows,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    req.flash('error_msg', 'Error fetching jobs');
    res.redirect('/');
  }
};

// Get job details
exports.getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get job details
    const jobResult = await db.query(`
      SELECT j.*, c.first_name, c.last_name, c.company_name 
      FROM jobs j
      INNER JOIN clients c ON j.client_id = c.id
      WHERE j.id = $1
    `, [id]);
    
    if (jobResult.rows.length === 0) {
      req.flash('error_msg', 'Job not found');
      return res.redirect('/jobs');
    }
    
    const job = jobResult.rows[0];
    
    // Check if current freelancer has already applied
    let hasApplied = false;
    
    if (req.user && req.user.role === 'freelancer') {
      const applicationResult = await db.query(
        'SELECT * FROM job_applications WHERE job_id = $1 AND freelancer_id = $2',
        [id, req.user.profile ? req.user.profile.id : req.user.id]
      );
      
      hasApplied = applicationResult.rows.length > 0;
    }
        let application = 0;
    if (applicationResult.rows.length > 0) {
      application = applicationResult.rows[0];
    }

    res.render('freelancer/job-details', {
      application,
      job,
      hasApplied,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching job details:', error);
    req.flash('error_msg', 'Error fetching job details');
    res.redirect('/jobs');
  }
};

// Get job application form
exports.getApplyJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get job details
    const jobResult = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);
    
    if (jobResult.rows.length === 0) {
      req.flash('error_msg', 'Job not found');
      return res.redirect('/jobs');
    }
    
    // Check if job is still open
    if (jobResult.rows[0].status !== 'open') {
      req.flash('error_msg', 'This job is no longer accepting applications');
      return res.redirect(`/jobs/${id}`);
    }
    
    // Check if already applied
    const applicationResult = await db.query(
      'SELECT * FROM job_applications WHERE job_id = $1 AND freelancer_id = $2',
      [id, req.user.profile ? req.user.profile.id : req.user.id]
    );
    
    if (applicationResult.rows.length > 0) {
      req.flash('error_msg', 'You have already applied for this job');
      return res.redirect(`/jobs/${id}`);
    }
    
    res.render('freelancer/apply-job', {
      job: jobResult.rows[0],
      user: req.user
    });
  } catch (error) {
    console.error('Error loading application form:', error);
    req.flash('error_msg', 'Error loading application form');
    res.redirect('/jobs');
  }
};

// Submit job application
exports.postApplyJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivation } = req.body;
    
    if (!motivation || motivation.trim().length < 10) {
      req.flash('error_msg', 'Please provide a proper motivation (at least 10 characters)');
      return res.redirect(`/jobs/${id}/apply`);
    }
    
    // Check if job exists and is open
    const jobResult = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);
    
    if (jobResult.rows.length === 0) {
      req.flash('error_msg', 'Job not found');
      return res.redirect('/jobs');
    }
    
    if (jobResult.rows[0].status !== 'open') {
      req.flash('error_msg', 'This job is no longer accepting applications');
      return res.redirect(`/jobs/${id}`);
    }
    
    // Insert application
    await db.query(
      'INSERT INTO job_applications (job_id, freelancer_id, motivation) VALUES ($1, $2, $3)',
      [id, req.user.profile ? req.user.profile.id : req.user.id, motivation]
    );
    
    req.flash('success_msg', 'Application submitted successfully');
    res.redirect('/freelancer/applications');
  } catch (error) {
    console.error('Error submitting application:', error);
    req.flash('error_msg', 'Error submitting application');
    res.redirect(`/jobs/${req.params.id}/apply`);
  }
};

// Client: Get job creation form
exports.getCreateJob = (req, res) => {
  res.render('client/job-form', {
    job: null,
    edit: false,
    user: req.user
  });
};

// Client: Process job creation
exports.postCreateJob = async (req, res) => {
  try {
    const { title, description, requirements, budget, deadline } = req.body;
    const clientId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Validate inputs
    if (!title || !description || !budget) {
      req.flash('error_msg', 'Please fill all required fields');
      return res.redirect('/jobs/create');
    }
    
    // Create job (initially unpaid)
    const jobResult = await db.query(
      'INSERT INTO jobs (client_id, title, description, requirements, budget, deadline, status, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [clientId, title, description, requirements, budget, deadline, 'pending', 'unpaid']
    );
    
    const jobId = jobResult.rows[0].id;
    
    // Redirect to payment page
    res.redirect(`/payments/job/${jobId}`);
  } catch (error) {
    console.error('Error creating job:', error);
    req.flash('error_msg', 'Error creating job');
    res.redirect('/jobs/create');
  }
};

// Client: Get job edit form
exports.getEditJob = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Get job details and verify ownership
    const jobResult = await db.query(
      'SELECT * FROM jobs WHERE id = $1 AND client_id = $2',
      [id, clientId]
    );
    
    if (jobResult.rows.length === 0) {
      req.flash('error_msg', 'Job not found or you are not authorized to edit it');
      return res.redirect('/client/jobs');
    }
    
    // Only allow editing of jobs that are still open
    if (jobResult.rows[0].status !== 'open') {
      req.flash('error_msg', 'You cannot edit a job that is not open');
      return res.redirect('/client/jobs');
    }
    
    res.render('client/job-form', {
      job: jobResult.rows[0],
      edit: true,
      user: req.user
    });
  } catch (error) {
    console.error('Error loading job edit form:', error);
    req.flash('error_msg', 'Error loading job edit form');
    res.redirect('/client/jobs');
  }
};

// Client: Process job edit
exports.putEditJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requirements, budget, deadline } = req.body;
    const clientId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Validate inputs
    if (!title || !description || !budget) {
      req.flash('error_msg', 'Please fill all required fields');
      return res.redirect(`/jobs/${id}/edit`);
    }
    
    // Verify ownership and update
    const jobResult = await db.query(
      'UPDATE jobs SET title = $1, description = $2, requirements = $3, budget = $4, deadline = $5, updated_at = NOW() WHERE id = $6 AND client_id = $7 AND status = $8 RETURNING *',
      [title, description, requirements, budget, deadline, id, clientId, 'open']
    );
    
    if (jobResult.rows.length === 0) {
      req.flash('error_msg', 'Job not found, not open, or you are not authorized to edit it');
      return res.redirect('/client/jobs');
    }
    
    req.flash('success_msg', 'Job updated successfully');
    res.redirect('/client/jobs');
  } catch (error) {
    console.error('Error updating job:', error);
    req.flash('error_msg', 'Error updating job');
    res.redirect(`/jobs/${req.params.id}/edit`);
  }
};

// Client: Delete job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Verify ownership and delete
    const jobResult = await db.query(
      'DELETE FROM jobs WHERE id = $1 AND client_id = $2 AND status = $3 RETURNING *',
      [id, clientId, 'open']
    );
    
    if (jobResult.rows.length === 0) {
      req.flash('error_msg', 'Job not found, not open, or you are not authorized to delete it');
      return res.redirect('/client/jobs');
    }
    
    req.flash('success_msg', 'Job deleted successfully');
    res.redirect('/client/jobs');
  } catch (error) {
    console.error('Error deleting job:', error);
    req.flash('error_msg', 'Error deleting job');
    res.redirect('/client/jobs');
  }
};

// Client: View job applications
exports.getJobApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Get job details and verify ownership
    const jobResult = await db.query(
      'SELECT * FROM jobs WHERE id = $1 AND client_id = $2',
      [id, clientId]
    );
    
    if (jobResult.rows.length === 0) {
      req.flash('error_msg', 'Job not found or you are not authorized to view it');
      return res.redirect('/client/jobs');
    }
    
    // Get applications with freelancer details
    const applicationsResult = await db.query(`
      SELECT ja.*, f.first_name, f.last_name, f.skills, f.experience, f.cv_path
      FROM job_applications ja
      INNER JOIN freelancers f ON ja.freelancer_id = f.id
      WHERE ja.job_id = $1
      ORDER BY ja.created_at DESC
    `, [id]);
    
    res.render('client/job-applications', {
      job: jobResult.rows[0],
      applications: applicationsResult.rows,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    req.flash('error_msg', 'Error fetching job applications');
    res.redirect('/client/jobs');
  }
};

// Client: Hire freelancer
exports.postHireFreelancer = async (req, res) => {
  try {
    const { jobId, applicationId } = req.params;
    const clientId = req.user.profile ? req.user.profile.id : req.user.id;
    
    const client = await db.getClient();
    await client.query('BEGIN');
    
    // Verify job ownership
    const jobResult = await client.query(
      'SELECT * FROM jobs WHERE id = $1 AND client_id = $2',
      [jobId, clientId]
    );
    
    if (jobResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      req.flash('error_msg', 'Job not found or you are not authorized');
      return res.redirect('/client/jobs');
    }
    
    // Check if job is open and paid
    if (jobResult.rows[0].status !== 'open' || jobResult.rows[0].payment_status !== 'paid') {
      await client.query('ROLLBACK');
      client.release();
      req.flash('error_msg', 'Job is not open or payment is not confirmed');
      return res.redirect(`/client/jobs/${jobId}/applications`);
    }
    
    // Verify application exists
    const applicationResult = await client.query(
      'SELECT * FROM job_applications WHERE id = $1 AND job_id = $2',
      [applicationId, jobId]
    );
    
    if (applicationResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      req.flash('error_msg', 'Application not found');
      return res.redirect(`/client/jobs/${jobId}/applications`);
    }
    
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
    client.release();
    
    req.flash('success_msg', 'Freelancer hired successfully');
    res.redirect('/client/jobs');
  } catch (error) {
    console.error('Error hiring freelancer:', error);
    req.flash('error_msg', 'Error hiring freelancer');
    res.redirect(`/client/jobs/${req.params.jobId}/applications`);
  }
};

// Client: Mark job as complete
exports.postCompleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.profile ? req.user.profile.id : req.user.id;
    
    const client = await db.getClient();
    await client.query('BEGIN');
    
    // Verify job ownership and status
    const jobResult = await client.query(
      'SELECT * FROM jobs WHERE id = $1 AND client_id = $2 AND status = $3',
      [id, clientId, 'in-progress']
    );
    
    if (jobResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      req.flash('error_msg', 'Job not found, not in progress, or you are not authorized');
      return res.redirect('/client/jobs');
    }
    
    // Update job completion record
    await client.query(
      'UPDATE job_completions SET client_confirmed = true, updated_at = NOW() WHERE job_id = $1',
      [id]
    );
    
    // Check if both client and freelancer have confirmed
    const completionResult = await client.query(
      'SELECT * FROM job_completions WHERE job_id = $1',
      [id]
    );
    
    // If both confirmed, mark job as complete
    if (completionResult.rows[0].freelancer_confirmed) {
      await client.query(
        'UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2',
        ['completed', id]
      );
      
      await client.query(
        'UPDATE job_completions SET completed_at = NOW() WHERE job_id = $1',
        [id]
      );
      
      // Get the hired freelancer to pay them
      const hiredApplicationResult = await client.query(
        'SELECT * FROM job_applications WHERE job_id = $1 AND status = $2',
        [id, 'hired']
      );
      
      if (hiredApplicationResult.rows.length > 0) {
        const freelancerId = hiredApplicationResult.rows[0].freelancer_id;
        
        // Get freelancer user_id for payment
        const freelancerResult = await client.query(
          'SELECT user_id FROM freelancers WHERE id = $1',
          [freelancerId]
        );
        
        if (freelancerResult.rows.length > 0) {
          const freelancerUserId = freelancerResult.rows[0].user_id;
          
          // Create payment record for freelancer payment
          await client.query(
            'INSERT INTO payments (job_id, amount, payment_type, status, paid_by, paid_to) VALUES ($1, $2, $3, $4, $5, $6)',
            [id, jobResult.rows[0].budget, 'freelancer_payment', 'pending', null, freelancerUserId]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    client.release();
    
    req.flash('success_msg', 'Job marked as complete from your side');
    res.redirect('/client/jobs');
  } catch (error) {
    console.error('Error marking job as complete:', error);
    req.flash('error_msg', 'Error marking job as complete');
    res.redirect('/client/jobs');
  }
};

// Freelancer: Mark job as complete
exports.postFreelancerCompleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancerId = req.user.profile ? req.user.profile.id : req.user.id;
    
    const client = await db.getClient();
    await client.query('BEGIN');
    
    // Verify freelancer is hired for this job
    const applicationResult = await client.query(
      'SELECT * FROM job_applications WHERE job_id = $1 AND freelancer_id = $2 AND status = $3',
      [id, freelancerId, 'hired']
    );
    
    if (applicationResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      req.flash('error_msg', 'Job not found or you are not hired for this job');
      return res.redirect('/freelancer/jobs');
    }
    
    // Verify job is in progress
    const jobResult = await client.query(
      'SELECT * FROM jobs WHERE id = $1 AND status = $2',
      [id, 'in-progress']
    );
    
    if (jobResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      req.flash('error_msg', 'Job is not in progress');
      return res.redirect('/freelancer/jobs');
    }
    
    // Update job completion record
    await client.query(
      'UPDATE job_completions SET freelancer_confirmed = true, updated_at = NOW() WHERE job_id = $1',
      [id]
    );
    
    // Check if both client and freelancer have confirmed
    const completionResult = await client.query(
      'SELECT * FROM job_completions WHERE job_id = $1',
      [id]
    );
    
    // If both confirmed, mark job as complete
    if (completionResult.rows[0].client_confirmed) {
      await client.query(
        'UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2',
        ['completed', id]
      );
      
      await client.query(
        'UPDATE job_completions SET completed_at = NOW() WHERE job_id = $1',
        [id]
      );
      
      // Get client user_id and create payment for freelancer
      const jobWithClientResult = await client.query(
        'SELECT j.*, c.user_id as client_user_id FROM jobs j JOIN clients c ON j.client_id = c.id WHERE j.id = $1',
        [id]
      );
      
      if (jobWithClientResult.rows.length > 0) {
        const clientUserId = jobWithClientResult.rows[0].client_user_id;
        
        // Get freelancer user_id
        const freelancerResult = await client.query(
          'SELECT user_id FROM freelancers WHERE id = $1',
          [freelancerId]
        );
        
        if (freelancerResult.rows.length > 0) {
          const freelancerUserId = freelancerResult.rows[0].user_id;
          
          // Create payment record for freelancer payment if not already created
          const paymentCheck = await client.query(
            'SELECT * FROM payments WHERE job_id = $1 AND payment_type = $2',
            [id, 'freelancer_payment']
          );
          
          if (paymentCheck.rows.length === 0) {
            await client.query(
              'INSERT INTO payments (job_id, amount, payment_type, status, paid_by, paid_to) VALUES ($1, $2, $3, $4, $5, $6)',
              [id, jobWithClientResult.rows[0].budget, 'freelancer_payment', 'pending', clientUserId, freelancerUserId]
            );
          }
        }
      }
    }
    
    await client.query('COMMIT');
    client.release();
    
    req.flash('success_msg', 'Job marked as complete from your side');
    res.redirect('/freelancer/jobs');
  } catch (error) {
    console.error('Error marking job as complete:', error);
    req.flash('error_msg', 'Error marking job as complete');
    res.redirect('/freelancer/jobs');
  }
};

// Admin: Get all jobs
exports.adminGetAllJobs = async (req, res) => {
  try {
    // Get all jobs with client info
    const jobsResult = await db.query(`
      SELECT j.*, c.first_name AS client_first_name, c.last_name AS client_last_name, c.company_name
      FROM jobs j
      INNER JOIN clients c ON j.client_id = c.id
      ORDER BY j.created_at DESC
    `);
    
    res.render('admin/jobs', {
      jobs: jobsResult.rows,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    req.flash('error_msg', 'Error fetching jobs');
    res.redirect('/admin/dashboard');
  }
};

// Admin: Get job details
exports.adminGetJobDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get job details with client info
    const jobResult = await db.query(`
      SELECT j.*, c.first_name AS client_first_name, c.last_name AS client_last_name, c.company_name
      FROM jobs j
      INNER JOIN clients c ON j.client_id = c.id
      WHERE j.id = $1
    `, [id]);
    
    if (jobResult.rows.length === 0) {
      req.flash('error_msg', 'Job not found');
      return res.redirect('/admin/jobs');
    }
    const job = jobResult.rows[0];
    // Get applications with freelancer details
    const applicationsResult = await db.query(`
      SELECT ja.*, f.first_name, f.last_name, f.skills, f.experience, f.cv_path
      FROM job_applications ja
      INNER JOIN freelancers f ON ja.freelancer_id = f.id
      WHERE ja.job_id = $1
      ORDER BY ja.created_at DESC
    `, [id]);
    
    // Get payment info
    const paymentResult = await db.query(
      'SELECT * FROM payments WHERE job_id = $1 ORDER BY created_at DESC',
      [id]
    );
    const completionStatus = job.status === 'in-progress' || job.status === 'completed' ? await db.query('SELECT * FROM job_completions WHERE job_id = $1', [job.id]).then(res => res.rows[0]) : null;
// Get any reports for this job
    const reports = await db.query(`
      SELECT r.*, u.email as reporter_email 
      FROM reports r 
      JOIN users u ON r.reported_by = u.id 
      WHERE r.job_id = $1
    `, [job.id]).then(res => res.rows);
    const query1 = await db.query('SELECT user_id FROM freelancers WHERE id = $1', [hiredApplication.freelancer_id])
                  .then(res => res.rows[0]?.user_id);
    res.render('admin/job-details', {
      query1,
      reports,
      completionStatus,
      job: jobResult.rows[0],
      applications: applicationsResult.rows,
      payments: paymentResult.rows,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching job details:', error);
    req.flash('error_msg', 'Error fetching job details');
    res.redirect('/admin/jobs');
  }
};

// Admin: Delete job
exports.adminDeleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM jobs WHERE id = $1', [id]);
    
    req.flash('success_msg', 'Job deleted successfully');
    res.redirect('/admin/jobs');
  } catch (error) {
    console.error('Error deleting job:', error);
    req.flash('error_msg', 'Error deleting job');
    res.redirect('/admin/jobs');
  }
};

// Get invoice
exports.getJobInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get job details
    let jobResult;
    
    if (req.user.role === 'admin') {
      jobResult = await db.query(`
        SELECT j.*, c.first_name AS client_first_name, c.last_name AS client_last_name, 
               c.company_name, c.phone AS client_phone, c.address AS client_address,
               c.email AS client_email
        FROM jobs j
        INNER JOIN clients c ON j.client_id = c.id
        INNER JOIN users u ON c.user_id = u.id
        WHERE j.id = $1
      `, [id]);
    } else if (req.user.role === 'client') {
      jobResult = await db.query(`
        SELECT j.*, c.first_name AS client_first_name, c.last_name AS client_last_name, 
               c.company_name, c.phone AS client_phone, c.address AS client_address,
               u.email AS client_email
        FROM jobs j
        INNER JOIN clients c ON j.client_id = c.id
        INNER JOIN users u ON c.user_id = u.id
        WHERE j.id = $1 AND c.user_id = $2
      `, [id, userId]);
    } else { // freelancer
      jobResult = await db.query(`
        SELECT j.*, c.first_name AS client_first_name, c.last_name AS client_last_name, 
               c.company_name, c.phone AS client_phone, c.address AS client_address,
               u.email AS client_email
        FROM jobs j
        INNER JOIN clients c ON j.client_id = c.id
        INNER JOIN users u ON c.user_id = u.id
        INNER JOIN job_applications ja ON j.id = ja.job_id
        WHERE j.id = $1 AND ja.freelancer_id = $2 AND ja.status = 'hired'
      `, [id, req.user.profile ? req.user.profile.id : req.user.id]);
    }
    
    if (jobResult.rows.length === 0) {
      req.flash('error_msg', 'Job not found or you are not authorized to view this invoice');
      return res.redirect('/');
    }
    
    const job = jobResult.rows[0];
    
    // Get hired freelancer info
    const freelancerResult = await db.query(`
      SELECT f.first_name, f.last_name, f.phone, f.address, u.email
      FROM freelancers f
      INNER JOIN users u ON f.user_id = u.id
      INNER JOIN job_applications ja ON f.id = ja.freelancer_id
      WHERE ja.job_id = $1 AND ja.status = 'hired'
    `, [id]);
    
    let freelancer = null;
    if (freelancerResult.rows.length > 0) {
      freelancer = freelancerResult.rows[0];
    }
    
    // Generate CSV
    const { generateCsv } = require('../utils/csvGenerator');
    const csvData = generateCsv(job, freelancer);
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-job-${id}.csv`);
    
    // Send CSV data
    res.send(csvData);
  } catch (error) {
    console.error('Error generating invoice:', error);
    req.flash('error_msg', 'Error generating invoice');
    res.redirect('/');
  }
};