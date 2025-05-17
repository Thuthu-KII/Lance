const db = require('../config/database');
const fileService = require('../services/fileService');

module.exports = {
  // Admin dashboard
  getDashboard: async (req, res) => {
    try {
      const users = await db.query('SELECT * FROM users');
      const jobs = await db.query('SELECT * FROM jobs');
      const reports = await db.query('SELECT * FROM user_reports WHERE status = $1', ['pending']);
      
      res.render('admin/dashboard', { 
        users: users.rows,
        jobs: jobs.rows,
        reports: reports.rows
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  },

  // Verify freelancer
  verifyFreelancer: async (req, res) => {
    try {
      const { userId, status } = req.body;
      
      await db.query(
        'UPDATE freelancer_verification SET status = $1, verified_at = NOW(), verified_by = $2 WHERE user_id = $3',
        [status, req.user.id, userId]
      );
      
      if (status === 'approved') {
        await db.query('UPDATE users SET verified = true WHERE id = $1', [userId]);
      }
      
      res.redirect('/admin/dashboard');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  },

  // Resolve report
  resolveReport: async (req, res) => {
    try {
      const { reportId, resolution } = req.body;
      
      await db.query(
        'UPDATE user_reports SET status = $1, resolved_at = NOW(), resolution = $2 WHERE id = $3',
        ['resolved', resolution, reportId]
      );
      
      res.redirect('/admin/dashboard');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
};