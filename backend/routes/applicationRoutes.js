const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ensureAuthenticated } = require('../controllers/authController');
const { apply, listForJob } = require('../controllers/applicationController');

const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req,file,cb) => {
      cb(null, `public/uploads/${file.fieldname}/`);
    },
    filename: (req,file,cb) => cb(null, Date.now() + '-' + file.originalname)
  }),
  limits: { fileSize: +process.env.MAX_CLEARANCE_SIZE }
});

router.post('/apply',
  ensureAuthenticated,
  upload.fields([
    { name:'cv', maxCount:1 },
    { name:'clearance', maxCount:1 }
  ]),
  apply
);

router.get('/job/:jobId', ensureAuthenticated, listForJob);

module.exports = router;
