const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configure Multer (stores files in memory or disk)
const storage = multer.memoryStorage(); 
const upload = multer({ storage });

// Single file handler
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.status(200).send('Upload successful!');
});

module.exports = router;
