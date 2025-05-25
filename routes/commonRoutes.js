const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { upload } = require('../middleware/fileUpload');

router.get('/pricing', (req, res) => {
 res.render('foot/pricing');
});
router.get('/about', (req, res) => {
 res.render('foot/about');
});
router.get('/contacts', (req, res) => {
 res.render('foot/contact');
});
router.get('/blog', (req, res) => {
 res.render('foot/blog');
});
router.get('/help', (req, res) => {
 res.render('foot/help');
});
router.get('/terms', (req, res) => {
 res.render('foot/terms');
});
router.get('/privacy', (req, res) => {
 res.render('foot/privacy');
});

module.exports = router;