const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const cvDir = path.join(__dirname, '../public/uploads/cvs');
const clearanceDir = path.join(__dirname, '../public/uploads/clearances');

if (!fs.existsSync(cvDir)) {
  fs.mkdirSync(cvDir, { recursive: true });
}

if (!fs.existsSync(clearanceDir)) {
  fs.mkdirSync(clearanceDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'cv') {
      cb(null, cvDir);
    } else if (file.fieldname === 'clearance') {
      cb(null, clearanceDir);
    } else {
      cb(new Error('Invalid file field'));
    }
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, fileName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed'));
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = { upload };