const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.YOCO_SECRET_KEY;
const baseUrl = 'https://api.yoco.com/v1';

// Simulate Yoco API for development
const yoco = {
  payments: {
    create: async (paymentData) => {
      // In production, use real Yoco API
      if (process.env.NODE_ENV === 'production') {
        try {
          const response = await axios.post(`${baseUrl}/charges`, paymentData, {
            headers: {
              'X-Auth-Secret-Key': apiKey,
              'Content-Type': 'application/json'
            }
          });
          return response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || 'Payment processing failed');
        }
      }
      
      // Simulate successful payment for development
      return {
        id: `ch_${Date.now()}`,
        status: 'successful',
        amount: paymentData.amountInCents,
        currency: paymentData.currency,
        metadata: paymentData.metadata
      };
    }
  }
};

module.exports = yoco;