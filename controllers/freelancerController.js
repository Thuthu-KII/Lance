const db = require('../config/database');

// Freelancer dashboard
exports.getDashboard = async (req, res) => {
  try {
        // Check if freelancer is approved
    if (req.user.role === 'freelancer' && 
        req.user.profile && 
        !req.user.profile.is_approved) {
      return res.redirect('/freelancer/pending');
    }
    
    const freelancerId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Get freelancer's applications
    const applicationsResult = await db.query(`
      SELECT ja.*, j.title, j.budget, j.status AS job_status, c.first_name AS client_first_name, c.last_name AS client_last_name
      FROM job_applications ja
      INNER JOIN jobs j ON ja.job_id = j.id
      INNER JOIN clients c ON j.client_id = c.id
      WHERE ja.freelancer_id = $1
      ORDER BY ja.created_at DESC
      LIMIT 5
    `, [freelancerId]);
    
    // Get active jobs (hired and in progress)
    const activeJobsResult = await db.query(`
      SELECT j.*, c.first_name AS client_first_name, c.last_name AS client_last_name, c.company_name
      FROM jobs j
      INNER JOIN clients c ON j.client_id = c.id
      INNER JOIN job_applications ja ON j.id = ja.job_id
      WHERE ja.freelancer_id = $1 AND ja.status = $2 AND j.status = $3
      ORDER BY j.updated_at DESC
    `, [freelancerId, 'hired', 'in-progress']);
    
    // Get counts
    const counts = {
      applications: (await db.query('SELECT COUNT(*) FROM job_applications WHERE freelancer_id = $1', [freelancerId])).rows[0].count,
      activeJobs: activeJobsResult.rows.length,
      completedJobs: (await db.query(`
        SELECT COUNT(*) FROM jobs j
        INNER JOIN job_applications ja ON j.id = ja.job_id
        WHERE ja.freelancer_id = $1 AND ja.status = $2 AND j.status = $3
      `, [freelancerId, 'hired', 'completed'])).rows[0].count
    };
    
    // Get recent available jobs
    const availableJobsResult = await db.query(`
      SELECT j.*, c.company_name
      FROM jobs j
      INNER JOIN clients c ON j.client_id = c.id
      WHERE j.status = 'open'
      AND NOT EXISTS (
        SELECT 1 FROM job_applications ja 
        WHERE ja.job_id = j.id AND ja.freelancer_id = $1
      )
      ORDER BY j.created_at DESC
      LIMIT 5
    `, [freelancerId]);
    
    res.render('freelancer/dashboard', {
      applications: applicationsResult.rows,
      activeJobs: activeJobsResult.rows,
      availableJobs: availableJobsResult.rows,
      counts,
      user: req.user
    });
  } catch (error) {
    console.error('Error loading freelancer dashboard:', error);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/');
  }
};

// Pending approval page
exports.getPendingPage = (req, res) => {
  res.render('freelancer/pending-approval', {
    user: req.user
  });
};

// Get freelancer's applications
exports.getApplications = async (req, res) => {
  try {
    const freelancerId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Get all applications
    const applicationsResult = await db.query(`
      SELECT ja.*, j.title, j.description, j.budget, j.deadline, j.status AS job_status, 
             c.first_name AS client_first_name, c.last_name AS client_last_name, c.company_name
      FROM job_applications ja
      INNER JOIN jobs j ON ja.job_id = j.id
      INNER JOIN clients c ON j.client_id = c.id
      WHERE ja.freelancer_id = $1
      ORDER BY ja.created_at DESC
    `, [freelancerId]);
    
    res.render('freelancer/applications', {
      applications: applicationsResult.rows,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    req.flash('error_msg', 'Error fetching applications');
    res.redirect('/freelancer/dashboard');
  }
};

// Get freelancer's active jobs
exports.getActiveJobs = async (req, res) => {
  try {
    const freelancerId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Get active jobs (hired and in progress or completed)
    const jobsResult = await db.query(`
      SELECT j.*, c.first_name AS client_first_name, c.last_name AS client_last_name, c.company_name,
             ja.status AS application_status, ja.created_at AS application_date
      FROM jobs j
      INNER JOIN clients c ON j.client_id = c.id
      INNER JOIN job_applications ja ON j.id = ja.job_id
      WHERE ja.freelancer_id = $1 AND ja.status = $2
      ORDER BY 
        CASE 
          WHEN j.status = 'in-progress' THEN 0
          WHEN j.status = 'completed' THEN 1
          ELSE 2
        END,
        j.updated_at DESC
    `, [freelancerId, 'hired']);
    
    // Get completion status for each job
    const jobs = await Promise.all(jobsResult.rows.map(async (job) => {
      if (job.status === 'in-progress' || job.status === 'completed') {
        const completionResult = await db.query(
          'SELECT * FROM job_completions WHERE job_id = $1',
          [job.id]
        );
        
        if (completionResult.rows.length > 0) {
          job.completionStatus = completionResult.rows[0];
        }
      }
      return job;
    }));
    
    res.render('freelancer/active-jobs', {
      jobs,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching active jobs:', error);
    req.flash('error_msg', 'Error fetching active jobs');
    res.redirect('/freelancer/dashboard');
  }
};

// Get job details for a freelancer
exports.getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancerId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Get job details
    const jobResult = await db.query(`
      SELECT j.*, c.first_name AS client_first_name, c.last_name AS client_last_name, 
             c.company_name, c.skills AS client_skills, c.experience AS client_experience
      FROM jobs j
      INNER JOIN clients c ON j.client_id = c.id
      WHERE j.id = $1
    `, [id]);
    
    if (jobResult.rows.length === 0) {
      req.flash('error_msg', 'Job not found');
      return res.redirect('/freelancer/jobs');
    }
    
    const job = jobResult.rows[0];
    
    // Check application status
    const applicationResult = await db.query(
      'SELECT * FROM job_applications WHERE job_id = $1 AND freelancer_id = $2',
      [id, freelancerId]
    );
    
    let application = 0;
    if (applicationResult.rows.length > 0) {
      application = applicationResult.rows[0];
    }
    
    // Get completion status if applicable
    let completionStatus = null;
    if (job.status === 'in-progress' || job.status === 'completed') {
      const completionResult = await db.query(
        'SELECT * FROM job_completions WHERE job_id = $1',
        [id]
      );
      
      if (completionResult.rows.length > 0) {
        completionStatus = completionResult.rows[0];
      }
    }
    
    res.render('freelancer/job-details', {
      job,
      application,
      completionStatus,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching job details:', error);
    req.flash('error_msg', 'Error fetching job details');
    res.redirect('/freelancer/jobs');
  }
};

// Add to your freelancerController.js
exports.getCompleteProfile = (req, res) => {
  if (req.user.role !== 'freelancer') {
    return res.redirect('/');
  }
  
  res.render('auth/complete-profile-freelancer', {
    user: req.user,
    title: 'Complete Your Profile'
  });
};

// Add this to your freelancerController.js
exports.getProfile = async (req, res) => {
  try {
    const freelancerId = req.user.profile ? req.user.profile.id : req.user.id;
    
    // Get freelancer details
    const freelancerResult = await db.query(
      'SELECT * FROM freelancers WHERE id = $1',
      [freelancerId]
    );
    
    if (freelancerResult.rows.length === 0) {
      req.flash('error_msg', 'Freelancer profile not found');
      return res.redirect('/freelancer/dashboard');
    }
    
    const freelancer = freelancerResult.rows[0];
    
    // Get statistics
    const stats = {
      completedJobs: (await db.query(`
        SELECT COUNT(*) FROM jobs j
        INNER JOIN job_applications ja ON j.id = ja.job_id
        WHERE ja.freelancer_id = $1 AND j.status = 'completed' AND ja.status = 'hired'
      `, [freelancerId])).rows[0].count,
      
      activeJobs: (await db.query(`
        SELECT COUNT(*) FROM jobs j
        INNER JOIN job_applications ja ON j.id = ja.job_id
        WHERE ja.freelancer_id = $1 AND j.status = 'in-progress' AND ja.status = 'hired'
      `, [freelancerId])).rows[0].count,
      
      totalApplications: (await db.query(
        'SELECT COUNT(*) FROM job_applications WHERE freelancer_id = $1',
        [freelancerId]
      )).rows[0].count
    };
    
    res.render('freelancer/profile', {
      freelancer,
      stats,
      user: req.user
    });
  } catch (error) {
    console.error('Error loading freelancer profile:', error);
    req.flash('error_msg', 'Error loading profile');
    res.redirect('/freelancer/dashboard');
  }
};

exports.postCompleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, skills, experience, hourlyRate, bio } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !skills || !experience) {
      req.flash('error_msg', 'All fields are required');
      return res.redirect('/auth/complete-profile-freelancer');
    }
    
    // Check if freelancer record already exists
    const existingFreelancer = await db.query(
      'SELECT * FROM freelancers WHERE user_id = $1',
      [userId]
    );
    
    if (existingFreelancer.rows.length > 0) {
      // Update existing record
      await db.query(
        'UPDATE freelancers SET first_name = $1, last_name = $2, skills = $3, experience = $4, hourly_rate = $5, bio = $6 WHERE user_id = $7',
        [firstName, lastName, skills, experience, hourlyRate, bio, userId]
      );
    } else {
      // Create new record
      await db.query(
        'INSERT INTO freelancers (user_id, first_name, last_name, skills, experience, hourly_rate, bio, is_approved) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, firstName, lastName, skills, experience, hourlyRate, bio, false]
      );
    }
    
    req.flash('success_msg', 'Profile completed! Your profile is now pending approval.');
    res.redirect('/freelancer/pending');
  } catch (error) {
    console.error('Error completing profile:', error);
    req.flash('error_msg', 'Error completing profile');
    res.redirect('/auth/complete-profile-freelancer');
  }
};

// Report a problem with a job
exports.reportJobIssue = async (req, res) => {
  const { id } = req.params;
  try {
    
    const { issue, reportedUser } = req.body;
    const userId = req.user.id;
    
    if (!issue || issue.trim().length < 10) {
      req.flash('error_msg', 'Please provide a detailed description of the issue (at least 10 characters)');
      return res.redirect(`/freelancer/jobs/${id}`);
    }
    console.log(">>>>>>>>>>>>> ",id);
    // Create report
    await db.query(
      'INSERT INTO reports (reported_by, reported_user, job_id, issue, status) VALUES ($1, $2, $3, $4, $5)',
      [userId, parseInt(reportedUser), id, issue, 'pending']
    );
    
    req.flash('success_msg', 'Issue reported successfully. An admin will review it shortly.');
    res.redirect(`/freelancer/jobs/${id}`);
  } catch (error) {
    console.error('Error reporting issue:', error);
    req.flash('error_msg', 'Error reporting issue');
    res.redirect(`/freelancer/jobs/${id}`);
  }
};

// Add to freelancerController.js
exports.getPendingPage = (req, res) => {
  res.render('freelancer/pending', {
    user: req.user,
    title: 'Approval Pending'
  });
};