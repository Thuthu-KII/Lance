const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ensureAuthenticated } = require('../controllers/authController');
const { postProfile } = require('../controllers/userController');

const cvUpload = multer({
  dest: 'public/uploads/cvs/',
  limits: { fileSize: +process.env.MAX_CV_SIZE },
  fileFilter: (_, file, cb) => {
    const ok = /\.(pdf|docx)$/i.test(file.originalname);
    cb(ok?null:new Error('Invalid CV format'), ok);
  }
});

router.get('/dashboard', ensureAuthenticated, (req,res) => res.render('clientDashboard'));
router.post('/profile', ensureAuthenticated, cvUpload.single('cv'), postProfile);

module.exports = router;
