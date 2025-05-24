const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const Payment = require('../../models/Payment');
const db = require('../../config/database');

jest.mock('../../config/database');

describe('Payment Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns a payment when found', async () => {
      const mockPayment = { id: 1, amount: 100 };
      db.query.mockResolvedValue({ rows: [mockPayment] });

      const result = await Payment.findById(1);
      expect(result).toEqual(mockPayment);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM payments WHERE id = $1', [1]);
    });

    it('returns null when not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const result = await Payment.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and returns a new payment', async () => {
      const paymentData = {
        jobId: 1,
        amount: 200,
        transactionId: 'TX123',
        paymentType: 'freelancer_payment',
        status: 'pending',
        paidBy: 2,
        paidTo: 3,
      };
      const mockResponse = { rows: [{ id: 1, ...paymentData }] };

      db.query.mockResolvedValue(mockResponse);
      const result = await Payment.create(paymentData);

      expect(result).toEqual(mockResponse.rows[0]);
      expect(db.query).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates a payment and returns updated record', async () => {
      const mockUpdated = { id: 1, status: 'completed' };
      db.query.mockResolvedValue({ rows: [mockUpdated] });

      const result = await Payment.update(1, { status: 'completed' });

      expect(result).toEqual(mockUpdated);
      expect(db.query).toHaveBeenCalled();
    });

    it('returns original payment if no data to update', async () => {
      const mockFound = { id: 1, status: 'pending' };
      jest.spyOn(Payment, 'findById').mockResolvedValue(mockFound);

      const result = await Payment.update(1, {});
      expect(result).toEqual(mockFound);
    });
  });

  describe('getWithDetails', () => {
    it('returns detailed payment info', async () => {
      const mockDetails = { id: 1, job_title: 'Test Job' };
      db.query.mockResolvedValue({ rows: [mockDetails] });

      const result = await Payment.getWithDetails(1);
      expect(result).toEqual(mockDetails);
    });
  });

  describe('getAll', () => {
    it('returns payments with filters', async () => {
      const mockPayments = [{ id: 1 }, { id: 2 }];
      db.query.mockResolvedValue({ rows: mockPayments });

      const result = await Payment.getAll({ jobId: 1 });
      expect(result).toEqual(mockPayments);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE'), expect.any(Array));
    });

    it('returns all payments without filters', async () => {
      const mockPayments = [{ id: 1 }, { id: 2 }];
      db.query.mockResolvedValue({ rows: mockPayments });

      const result = await Payment.getAll();
      expect(result).toEqual(mockPayments);
    });
  });

  describe('getPendingFreelancerPayments', () => {
    it('returns only pending freelancer payments', async () => {
      const mockPayments = [{ id: 3 }];
      jest.spyOn(Payment, 'getAll').mockResolvedValue(mockPayments);

      const result = await Payment.getPendingFreelancerPayments();
      expect(result).toEqual(mockPayments);
    });
  });

  describe('getUserPaymentHistory', () => {
    it('returns a user\'s payment history', async () => {
      const mockHistory = [{ id: 1 }, { id: 2 }];
      db.query.mockResolvedValue({ rows: mockHistory });

      const result = await Payment.getUserPaymentHistory(10);
      expect(result).toEqual(mockHistory);
      expect(db.query).toHaveBeenCalledWith(expect.any(String), [10]);
    });
  });

  describe('getStatistics', () => {
    it('returns aggregated payment statistics', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ total: 500 }] }) // totalPayments
        .mockResolvedValueOnce({ rows: [{ total: 300 }] }) // clientPayments
        .mockResolvedValueOnce({ rows: [{ total: 200 }] }) // freelancerPayments
        .mockResolvedValueOnce({ rows: [{ total: 50 }] }); // pendingPayments

      const result = await Payment.getStatistics();
      expect(result).toEqual({
        totalPayments: 500,
        clientPayments: 300,
        freelancerPayments: 200,
        pendingPayments: 50,
        platformFees: 100,
      });
    });

    it('handles missing values safely', async () => {
      db.query.mockResolvedValue({ rows: [{}] }); // Return empty stats

      const result = await Payment.getStatistics();
      expect(result.totalPayments).toBe(0);
    });
  });
});
