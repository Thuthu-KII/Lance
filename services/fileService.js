const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
require('dotenv').config();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
  }
};

// Initialize upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = {
  uploadCV: (file, userId) => {
    return new Promise((resolve, reject) => {
      const ext = path.extname(file.originalname);
      const filename = `cv_${userId}${ext}`;
      const filepath = path.join(__dirname, '../../public/uploads', filename);

      fs.rename(file.path, filepath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(`/uploads/${filename}`);
        }
      });
    });
  },

  uploadVerification: (file, userId, type) => {
    return new Promise((resolve, reject) => {
      const ext = path.extname(file.originalname);
      const filename = `${type}_${userId}${ext}`;
      const filepath = path.join(__dirname, '../../public/uploads', filename);

      fs.rename(file.path, filepath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(`/uploads/${filename}`);
        }
      });
    });
  },

  getUploadMiddleware: (fieldName) => {
    return upload.single(fieldName);
  },

  getMultipleUploadMiddleware: (fields) => {
    return upload.fields(fields);
  }
};