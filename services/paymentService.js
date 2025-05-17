const axios = require('axios');
const db = require('../config/database');
const yocoConfig = require('../config/yocoConfig');

module.exports = {
  createPayment: async (jobId, amount, callbackUrl) => {
    try {
      const response = await axios.post(
        'https://payments.yoco.com/api/checkouts',
        {
          amount: amount * 100, // Yoco expects amount in cents
          currency: 'ZAR',
          successUrl: `${callbackUrl}?status=success`,
          cancelUrl: `${callbackUrl}?status=cancel`,
          metadata: {
            jobId: jobId
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${yocoConfig.secretKey}`
          }
        }
      );

      return response.data;
    } catch (err) {
      console.error('Payment error:', err.response.data);
      throw new Error('Payment processing failed');
    }
  },

  verifyPayment: async (paymentId) => {
    try {
      const response = await axios.get(
        `https://payments.yoco.com/api/checkouts/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${yocoConfig.secretKey}`
          }
        }
      );

      return response.data.status === 'completed';
    } catch (err) {
      console.error('Verification error:', err);
      return false;
    }
  }
};