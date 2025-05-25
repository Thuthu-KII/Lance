// config/yoco.js
const axios = require('axios');

const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;
// Update to the correct API URL
const YOCO_API_URL = 'https://online.yoco.com/v1/charges/';

// Create a proper Yoco service object
const yoco = {
  charge: async function(options) {
    try {
      const { token, amountInCents, currency, description } = options;
      
      console.log('Sending request to Yoco API:', {
        url: YOCO_API_URL,
        token: token,
        amountInCents: amountInCents,
        currency: currency
      });
      
      const response = await axios.post(
        YOCO_API_URL,
        {
          token: token,
          amountInCents: amountInCents,
          currency: currency,
          metadata: { description: description }
        },
        {
          headers: {
            'X-Auth-Secret-Key': YOCO_SECRET_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Yoco API Error:', error.message);
      // If it's an Axios error with a response, extract the Yoco error
      if (error.response && error.response.data) {
        console.error('Yoco API Response:', error.response.data);
        throw error.response.data;
      }
      throw error;
    }
  }
};

module.exports = yoco;