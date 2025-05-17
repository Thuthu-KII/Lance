const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { isAuthenticated, isClient, isFreelancer, isApprovedFreelancer } = require('../middleware/auth');

// Public job routes (no auth needed)
router.get('/', (req, res) => {
  res.redirect('/jobs/browse');
});

router.get('/browse', jobController.getAllJobs);
router.get('/:id', jobController.getJobDetails);

// Client routes
router.get('/create', isAuthenticated, isClient, jobController.getCreateJob);
router.post('/create', isAuthenticated, isClient, jobController.postCreateJob);
router.get('/:id/edit', isAuthenticated, isClient, jobController.getEditJob);
router.put('/:id', isAuthenticated, isClient, jobController.putEditJob);
router.delete('/:id', isAuthenticated, isClient, jobController.deleteJob);

// Freelancer routes
router.get('/:id/apply', isAuthenticated, isFreelancer, isApprovedFreelancer, jobController.getApplyJob);
router.post('/:id/apply', isAuthenticated, isFreelancer, isApprovedFreelancer, jobController.postApplyJob);

// Invoice generation
router.get('/:id/invoice', isAuthenticated, jobController.getJobInvoice);

module.exports = router;