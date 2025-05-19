const axios = require('axios');
const yoco = require('../../config/yoco'); // adjust path accordingly

jest.mock('axios');

describe('yoco.payments.create', () => {
  const samplePaymentData = {
    amountInCents: 1000,
    currency: 'ZAR',
    metadata: { orderId: '12345' },
  };

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.NODE_ENV;
  });

  it('returns simulated successful payment in development', async () => {
    process.env.NODE_ENV = 'development';

    const result = await yoco.payments.create(samplePaymentData);

    expect(result).toHaveProperty('id');
    expect(result.status).toBe('successful');
    expect(result.amount).toBe(samplePaymentData.amountInCents);
    expect(result.currency).toBe(samplePaymentData.currency);
    expect(result.metadata).toEqual(samplePaymentData.metadata);
  });

  it('sends payment to Yoco API in production and returns response', async () => {
    process.env.NODE_ENV = 'production';
    process.env.YOCO_SECRET_KEY = 'test_secret_key';

    const apiResponse = {
      data: {
        id: 'ch_987654321',
        status: 'successful',
        amount: 1000,
        currency: 'ZAR',
        metadata: { orderId: '12345' }
      }
    };

    axios.post.mockResolvedValue(apiResponse);

    const result = await yoco.payments.create(samplePaymentData);

    expect(axios.post).toHaveBeenCalledWith(
      'https://api.yoco.com/v1/charges',
      samplePaymentData,
      {
        headers: {
          'X-Auth-Secret-Key': 'test_secret_key',
          'Content-Type': 'application/json'
        }
      }
    );

    expect(result).toEqual(apiResponse.data);
  });

  it('throws error with Yoco message on failure in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.YOCO_SECRET_KEY = 'test_secret_key';

    axios.post.mockRejectedValue({
      response: {
        data: {
          message: 'Card declined'
        }
      }
    });

    await expect(yoco.payments.create(samplePaymentData)).rejects.toThrow('Card declined');
  });

  it('throws generic error if no specific message is available', async () => {
    process.env.NODE_ENV = 'production';
    axios.post.mockRejectedValue({});

    await expect(yoco.payments.create(samplePaymentData)).rejects.toThrow('Payment processing failed');
  });
});
