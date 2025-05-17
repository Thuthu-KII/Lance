const db = require('../config/database');
const fileService = require('../services/fileService');
const { hashPassword } = require('../services/authService');

module.exports = {
  getProfile: async (req, res) => {
    try {
      const result = await db.query(
        `SELECT id, email, display_name, role, phone, location, 
         years_experience, industry, cv_url, verified 
         FROM users WHERE id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  updateProfile: async (req, res) => {
    const { phone, location, yearsExperience, industry } = req.body;
    let cvUrl = null;

    try {
      if (req.file) {
        cvUrl = await fileService.uploadCV(req.file, req.user.id);
      }

      const result = await db.query(
        `UPDATE users 
         SET phone = $1, location = $2, years_experience = $3, 
             industry = $4, cv_url = COALESCE($5, cv_url) 
         WHERE id = $6 
         RETURNING *`,
        [phone, location, yearsExperience, industry, cvUrl, req.user.id]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  verifyFreelancer: async (req, res) => {
    const { policeClearance, idVerification } = req.files;

    try {
      const policeUrl = await fileService.uploadVerification(
        policeClearance, 
        req.user.id,
        'police'
      );
      
      const idUrl = await fileService.uploadVerification(
        idVerification, 
        req.user.id,
        'id'
      );

      await db.query(
        `INSERT INTO freelancer_verification 
         (user_id, police_clearance_url, id_verification_url) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           police_clearance_url = EXCLUDED.police_clearance_url,
           id_verification_url = EXCLUDED.id_verification_url,
           status = 'pending'`,
        [req.user.id, policeUrl, idUrl]
      );

      res.json({ message: 'Verification documents submitted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to submit verification' });
    }
  }
};