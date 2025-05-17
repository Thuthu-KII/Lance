const db = require('../config/database');

// Admin dashboard
exports.getDashboard = async (req, res) => {
  try {
    // Get counts and statistics
    const clientsCount = await db.query('SELECT COUNT(*) FROM clients');
    const freelancersCount = await db.query('SELECT COUNT(*) FROM freelancers');
    const jobsCount = await db.query('SELECT COUNT(*) FROM jobs');
    const paymentsSum = await db.query('SELECT SUM(amount) FROM payments WHERE status = $1', ['completed']);
    const pendingApprovalsCount = await db.query('SELECT COUNT(*) FROM freelancers WHERE is_approved = false');
    const reportsCount = await db.query('SELECT COUNT(*) FROM reports WHERE status = $1', ['pending']);
    
    // Get recent jobs
    const recentJobs = await db.query(`
      SELECT j.*, c.first_name, c.last_name, c.company_name
      FROM jobs j
      INNER JOIN clients c ON j.client_id = c.id
      ORDER BY j.created_at DESC
      LIMIT 5
    `);
    
    res.render('admin/dashboard', {
      counts: {
        clients: clientsCount.rows[0].count,
        freelancers: freelancersCount.rows[0].count,
        jobs: jobsCount.rows[0].count,
        payments: paymentsSum.rows[0].sum || 0,
        pendingApprovals: pendingApprovalsCount.rows[0].count,
        reports: reportsCount.rows[0].count
      },
      recentJobs: recentJobs.rows,
      user: req.user
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/');
  }
};

// Manage users - list all
exports.getUsers = async (req, res) => {
  try {
    // Get all users with role-specific details
    const usersResult = await db.query(`
      SELECT u.id, u.email, u.role, u.created_at,
             CASE
               WHEN u.role = 'client' THEN (SELECT c.first_name || ' ' || c.last_name FROM clients c WHERE c.user_id = u.id)
               WHEN u.role = 'freelancer' THEN (SELECT f.first_name || ' ' || f.last_name FROM freelancers f WHERE f.user_id = u.id)
               WHEN u.role = 'admin' THEN (SELECT a.first_name || ' ' || a.last_name FROM admins a WHERE a.user_id = u.id)
             END as full_name,
             CASE
               WHEN u.role = 'freelancer' THEN (SELECT f.is_approved FROM freelancers f WHERE f.user_id = u.id)
               ELSE true
             END as is_approved
      FROM users u
      ORDER BY u.created_at DESC
    `);
    
    res.render('admin/users', {
      users: usersResult.rows,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    req.flash('error_msg', 'Error fetching users');
    res.redirect('/admin/dashboard');
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userResult.rows.length === 0) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin/users');
    }
    
    const user = userResult.rows[0];
    let profile = null;
    
    // Get role-specific details
    if (user.role === 'client') {
      const profileResult = await db.query('SELECT * FROM clients WHERE user_id = $1', [id]);
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    } else if (user.role === 'freelancer') {
      const profileResult = await db.query('SELECT * FROM freelancers WHERE user_id = $1', [id]);
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    } else if (user.role === 'admin') {
      const profileResult = await db.query('SELECT * FROM admins WHERE user_id = $1', [id]);
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    }
    
    res.render('admin/user-details', {
      userData: user,
      profile,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    req.flash('error_msg', 'Error fetching user details');
    res.redirect('/admin/users');
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting self
    if (req.user.id === parseInt(id)) {
      req.flash('error_msg', 'You cannot delete your own account');
      return res.redirect('/admin/users');
    }
    
    // Delete user (cascade will handle role-specific records)
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    
    req.flash('success_msg', 'User deleted successfully');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    req.flash('error_msg', 'Error deleting user');
    res.redirect('/admin/users');
  }
};

// Get pending freelancer approvals
exports.getPendingApprovals = async (req, res) => {
  try {
    // Get pending freelancers
    const freelancersResult = await db.query(`
      SELECT f.*, u.email, u.created_at
      FROM freelancers f
      INNER JOIN users u ON f.user_id = u.id
      WHERE f.is_approved = false
      ORDER BY u.created_at ASC
    `);
    
    res.render('admin/freelancer-approvals', {
      freelancers: freelancersResult.rows,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    req.flash('error_msg', 'Error fetching pending approvals');
    res.redirect('/admin/dashboard');
  }
};

// Approve freelancer
exports.approveFreelancer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update approval status
    await db.query(
      'UPDATE freelancers SET is_approved = true, updated_at = NOW() WHERE id = $1',
      [id]
    );
    
    // Get freelancer email for notification
    const freelancerResult = await db.query(`
      SELECT u.email
      FROM freelancers f
      INNER JOIN users u ON f.user_id = u.id
      WHERE f.id = $1
    `, [id]);
    
    if (freelancerResult.rows.length > 0) {
      // Here you would normally send an email notification
      console.log(`Freelancer approved: ${freelancerResult.rows[0].email}`);
    }
    
    req.flash('success_msg', 'Freelancer approved successfully');
    res.redirect('/admin/approvals');
  } catch (error) {
    console.error('Error approving freelancer:', error);
    req.flash('error_msg', 'Error approving freelancer');
    res.redirect('/admin/approvals');
  }
};

// Reject freelancer
exports.rejectFreelancer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get freelancer user_id for deletion
    const freelancerResult = await db.query(
      'SELECT user_id FROM freelancers WHERE id = $1',
      [id]
    );
    
    if (freelancerResult.rows.length === 0) {
      req.flash('error_msg', 'Freelancer not found');
      return res.redirect('/admin/approvals');
    }
    
    const userId = freelancerResult.rows[0].user_id;
    
    // Delete user (cascade will handle freelancer record)
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    
    req.flash('success_msg', 'Freelancer rejected and account removed');
    res.redirect('/admin/approvals');
  } catch (error) {
    console.error('Error rejecting freelancer:', error);
    req.flash('error_msg', 'Error rejecting freelancer');
    res.redirect('/admin/approvals');
  }
};

// Get reports
exports.getReports = async (req, res) => {
  try {
    // Get all reports with user details
    const reportsResult = await db.query(`
      SELECT r.*, 
             u_reporter.email AS reporter_email,
             u_reported.email AS reported_email,
             j.title AS job_title
      FROM reports r
      LEFT JOIN users u_reporter ON r.reported_by = u_reporter.id
      LEFT JOIN users u_reported ON r.reported_user = u_reported.id
      LEFT JOIN jobs j ON r.job_id = j.id
      ORDER BY 
        CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END,
        r.created_at DESC
    `);
    
    res.render('admin/reports', {
      reports: reportsResult.rows,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    req.flash('error_msg', 'Error fetching reports');
    res.redirect('/admin/dashboard');
  }
};

// Get report details
exports.getReportDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get report with user details
    const reportResult = await db.query(`
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
    
    if (reportResult.rows.length === 0) {
      req.flash('error_msg', 'Report not found');
      return res.redirect('/admin/reports');
    }
    
    res.render('admin/report-details', {
      report: reportResult.rows[0],
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching report details:', error);
    req.flash('error_msg', 'Error fetching report details');
    res.redirect('/admin/reports');
  }
};

// Process report
exports.processReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    
    // Update report status
    await db.query(
      'UPDATE reports SET status = $1, admin_notes = $2, updated_at = NOW() WHERE id = $3',
      [action, notes, id]
    );
    
    req.flash('success_msg', 'Report processed successfully');
    res.redirect('/admin/reports');
  } catch (error) {
    console.error('Error processing report:', error);
    req.flash('error_msg', 'Error processing report');
    res.redirect(`/admin/reports/${req.params.id}`);
  }
};

// Add admin user
exports.addAdminUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Validate inputs
    if (!email || !password || !firstName || !lastName) {
      req.flash('error_msg', 'Please fill in all fields');
      return res.redirect('/admin/users');
    }
    
    // Check if email is already in use
    const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (emailCheck.rows.length > 0) {
      req.flash('error_msg', 'Email is already in use');
      return res.redirect('/admin/users');
    }
    
    const client = await db.getClient();
    await client.query('BEGIN');
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const userInsert = await client.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, 'admin']
    );
    
    const userId = userInsert.rows[0].id;
    
    // Insert admin profile
    await client.query(
      'INSERT INTO admins (user_id, first_name, last_name) VALUES ($1, $2, $3)',
      [userId, firstName, lastName]
    );
    
    await client.query('COMMIT');
    client.release();
    
    req.flash('success_msg', 'Admin user added successfully');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error adding admin user:', error);
    req.flash('error_msg', 'Error adding admin user');
    res.redirect('/admin/users');
  }
};

// System stats
exports.getSystemStats = async (req, res) => {
  try {
    // Get various counts and stats
    const counts = {
      users: (await db.query('SELECT COUNT(*) FROM users')).rows[0].count,
      clients: (await db.query('SELECT COUNT(*) FROM clients')).rows[0].count,
      freelancers: (await db.query('SELECT COUNT(*) FROM freelancers')).rows[0].count,
      admins: (await db.query('SELECT COUNT(*) FROM admins')).rows[0].count,
      jobs: (await db.query('SELECT COUNT(*) FROM jobs')).rows[0].count,
      openJobs: (await db.query('SELECT COUNT(*) FROM jobs WHERE status = $1', ['open'])).rows[0].count,
      inProgressJobs: (await db.query('SELECT COUNT(*) FROM jobs WHERE status = $1', ['in-progress'])).rows[0].count,
      completedJobs: (await db.query('SELECT COUNT(*) FROM jobs WHERE status = $1', ['completed'])).rows[0].count,
      applications: (await db.query('SELECT COUNT(*) FROM job_applications')).rows[0].count,
      reports: (await db.query('SELECT COUNT(*) FROM reports')).rows[0].count,
      pendingReports: (await db.query('SELECT COUNT(*) FROM reports WHERE status = $1', ['pending'])).rows[0].count
    };
    
    // Get financial stats
    const financialStats = {
      totalPayments: (await db.query('SELECT SUM(amount) FROM payments WHERE status = $1', ['completed'])).rows[0].sum || 0,
      clientPayments: (await db.query('SELECT SUM(amount) FROM payments WHERE payment_type = $1 AND status = $2', ['job_posting', 'completed'])).rows[0].sum || 0,
      freelancerPayments: (await db.query('SELECT SUM(amount) FROM payments WHERE payment_type = $1 AND status = $2', ['freelancer_payment', 'completed'])).rows[0].sum || 0,
      pendingPayments: (await db.query('SELECT SUM(amount) FROM payments WHERE status = $1', ['pending'])).rows[0].sum || 0
    };
    
    // Get monthly job stats for the past 12 months
    const monthlyJobsResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*) AS job_count
      FROM jobs
      WHERE created_at >= NOW() - INTERVAL '1 year'
      GROUP BY month
      ORDER BY month
    `);
    
    // Format monthly data for charts
    const monthlyJobs = monthlyJobsResult.rows.map(row => ({
      month: new Date(row.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: parseInt(row.job_count)
    }));
    
    res.render('admin/stats', {
      counts,
      financialStats,
      monthlyJobs,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    req.flash('error_msg', 'Error fetching system stats');
    res.redirect('/admin/dashboard');
  }
};