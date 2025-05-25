const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { isAuthenticated, isClient, isAdmin } = require('../middleware/auth');

// Client payment for job
router.get('/job/:id', isAuthenticated, isClient, paymentController.getJobPaymentPage);
router.post('/job/:id', isAuthenticated, isClient, paymentController.postJobPayment);

// router.post('/job/:id', async (req, res) => {
//   try {
//     const { token } = req.body;
//     const jobId = req.params.id;
    
//     // Add detailed logging
//     console.log(`Processing payment for job ${jobId} with token ${token}`);
    
//     // Your Yoco API call
//     const result = await yoco.charge({
//       token: token,
//       amountInCents: amount,
//       currency: 'ZAR',
//       // other required parameters
//     });
    
//     console.log('Yoco API response:', result);
    
//     // Rest of your processing code
    
//     res.json({ success: true });
//   } catch (error) {
//     // Detailed error logging
//     console.error('Payment processing error:', error);
    
//     // Send back more specific error message if possible
//     res.json({ 
//       success: false, 
//       message: 'We are currently experiencing issues, please retry at a later time.',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

module.exports = router;