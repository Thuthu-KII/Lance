const db = require('../config/database');

// Client dashboard
exports.getDashboard = async (req, res) => {
  try {
    // Add defensive check
    if (!req.user) {
      req.flash('error_msg', 'User session not found');
      return res.redirect('/auth/login');
    }
    
    // Use the correct path to the ID based on your user object structure
    const clientId = req.user.profile ? req.user.profile ? req.user.profile.id : req.user.id : req.user.id;
    
    // Get client's jobs
    const jobsResult = await db.query(
      'SELECT * FROM jobs WHERE client_id = $1 ORDER BY created_at DESC LIMIT 5',
      [clientId]
    );
    
    // Get counts
    const jobCounts = {
      total: (await db.query('SELECT COUNT(*) FROM jobs WHERE client_id = $1', [clientId])).rows[0].count,
      open: (await db.query('SELECT COUNT(*) FROM jobs WHERE client_id = $1 AND status = $2', [clientId, 'open'])).rows[0].count,
      inProgress: (await db.query('SELECT COUNT(*) FROM jobs WHERE client_id = $1 AND status = $2', [clientId, 'in-progress'])).rows[0].count,
      completed: (await db.query('SELECT COUNT(*) FROM jobs WHERE client_id = $1 AND status = $2', [clientId, 'completed'])).rows[0].count
    };
    
    // Get recent applications to client's jobs
    const applicationsResult = await db.query(`
      SELECT ja.*, j.title AS job_title, f.first_name, f.last_name
      FROM job_applications ja
      INNER JOIN jobs j ON ja.job_id = j.id
      INNER JOIN freelancers f ON ja.freelancer_id = f.id
      WHERE j.client_id = $1
      ORDER BY ja.created_at DESC
      LIMIT 5
    `, [clientId]);
    
    res.render('client/dashboard', {
      jobs: jobsResult.rows,
      jobCounts,
      applications: applicationsResult.rows,
      user: req.user
    });
  } catch (error) {
    console.error('Error loading client dashboard:', error);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/');
  }
};

// Get client's jobs
exports.getJobs = async (req, res) => {
  try {
    const clientId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Get all jobs for this client
    const jobsResult = await db.query(
      'SELECT * FROM jobs WHERE client_id = $1 ORDER BY created_at DESC',
      [clientId]
    );
    
    res.render('client/job-management', {
      jobs: jobsResult.rows,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    req.flash('error_msg', 'Error fetching jobs');
    res.redirect('/client/dashboard');
  }
};

// Get client's job details
exports.getJobDetails = async (req, res) => {
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
    
    // Get applications count
    const applicationsCount = await db.query(
      'SELECT COUNT(*) FROM job_applications WHERE job_id = $1',
      [id]
    );
    
    // Get hired freelancer if any
    const hiredFreelancerResult = await db.query(`
      SELECT f.first_name, f.last_name, f.skills, f.experience, f.cv_path, ja.created_at AS hired_at
      FROM job_applications ja
      INNER JOIN freelancers f ON ja.freelancer_id = f.id
      WHERE ja.job_id = $1 AND ja.status = $2
    `, [id, 'hired']);
    
    let hiredFreelancer = null;
    if (hiredFreelancerResult.rows.length > 0) {
      hiredFreelancer = hiredFreelancerResult.rows[0];
    }
    
    // Get job completion status if any
    let completionStatus = null;
    if (jobResult.rows[0].status === 'in-progress' || jobResult.rows[0].status === 'completed') {
      const completionResult = await db.query(
        'SELECT * FROM job_completions WHERE job_id = $1',
        [id]
      );
      
      if (completionResult.rows.length > 0) {
        completionStatus = completionResult.rows[0];
      }
    }
    
    res.render('client/job-details', {
      job: jobResult.rows[0],
      applicationsCount: applicationsCount.rows[0].count,
      hiredFreelancer,
      completionStatus,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching job details:', error);
    req.flash('error_msg', 'Error fetching job details');
    res.redirect('/client/jobs');
  }
};

// Report a problem with a job
exports.reportJobIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { issue, reportedUser } = req.body;
    const userId = req.user.id;
    
    if (!issue || issue.trim().length < 10) {
      req.flash('error_msg', 'Please provide a detailed description of the issue (at least 10 characters)');
      return res.redirect(`/client/jobs/${id}`);
    }
    
    // Create report
    await db.query(
      'INSERT INTO reports (reported_by, reported_user, job_id, issue, status) VALUES ($1, $2, $3, $4, $5)',
      [userId, reportedUser, id, issue, 'pending']
    );
    
    req.flash('success_msg', 'Issue reported successfully. An admin will review it shortly.');
    res.redirect(`/client/jobs/${id}`);
  } catch (error) {
    console.error('Error reporting issue:', error);
    req.flash('error_msg', 'Error reporting issue');
    res.redirect(`/client/jobs/${id}`);
  }
};