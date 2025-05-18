/**
 * Validation utilities for input validation
 */
const { check, validationResult } = require('express-validator');

// Validation rules for client registration
exports.clientRegisterValidation = [
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  check('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  check('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  check('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim()
];

// Validation rules for freelancer registration
exports.freelancerRegisterValidation = [
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  check('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  check('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  check('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim(),
  check('skills')
    .notEmpty()
    .withMessage('Please provide at least one skill')
    .trim(),
  check('experience')
    .notEmpty()
    .withMessage('Experience information is required')
    .trim()
];

// Validation rules for job creation
exports.jobValidation = [
  check('title')
    .notEmpty()
    .withMessage('Job title is required')
    .trim(),
  check('description')
    .notEmpty()
    .withMessage('Job description is required')
    .trim(),
  check('budget')
    .isNumeric()
    .withMessage('Budget must be a number')
    .custom(value => {
      if (parseFloat(value) <= 0) {
        throw new Error('Budget must be greater than 0');
      }
      return true;
    }),
  check('deadline')
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage('Deadline must be a valid date')
    .custom(value => {
      const deadlineDate = new Date(value);
      const today = new Date();
      if (deadlineDate < today) {
        throw new Error('Deadline cannot be in the past');
      }
      return true;
    })
];

// Validation rules for job application
exports.applicationValidation = [
  check('motivation')
    .notEmpty()
    .withMessage('Motivation is required')
    .isLength({ min: 10 })
    .withMessage('Motivation must be at least 10 characters long')
    .trim()
];

// Validation rules for profile update
exports.profileUpdateValidation = [
  check('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  check('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim(),
  check('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
    .trim()
];

// Validation rules for password change
exports.passwordChangeValidation = [
  check('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  check('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  check('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    })
];

// Validation rules for report submission
exports.reportValidation = [
  check('issue')
    .notEmpty()
    .withMessage('Issue description is required')
    .isLength({ min: 10 })
    .withMessage('Issue description must be at least 10 characters long')
    .trim()
];

// Process validation results
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Flash validation errors
exports.flashValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach(error => {
      req.flash('error_msg', error.msg);
    });
    return res.redirect('back');
  }
  next();
};