const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const db = require('../../config/database');
const Report = require('../../models/Report');

jest.mock('../../config/database');

describe('Report Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a report when found', async () => {
      const mockReport = { id: 1, issue: 'Test issue' };
      db.query.mockResolvedValue({ rows: [mockReport] });

      const result = await Report.findById(1);
      expect(result).toEqual(mockReport);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM reports WHERE id = $1', [1]);
    });

    it('should return null if no report is found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Report.findById(999);
      expect(result).toBeNull();
    });

    it('should throw an error when query fails', async () => {
      db.query.mockRejectedValue(new Error('DB Error'));
      await expect(Report.findById(1)).rejects.toThrow('DB Error');
    });
  });

  describe('create', () => {
    it('should insert and return a new report', async () => {
      const input = {
        reportedBy: 1,
        reportedUser: 2,
        jobId: 3,
        issue: 'Some issue',
      };

      const mockResult = { id: 1, ...input, status: 'pending' };
      db.query.mockResolvedValue({ rows: [mockResult] });

      const result = await Report.create(input);
      expect(result).toEqual(mockResult);
    });

    it('should throw an error if insert fails', async () => {
      db.query.mockRejectedValue(new Error('Insert failed'));

      await expect(Report.create({
        reportedBy: 1,
        reportedUser: 2,
        jobId: 3,
        issue: 'Error test',
      })).rejects.toThrow('Insert failed');
    });
  });

  describe('update', () => {
    it('should update report and return the updated row', async () => {
      const mockUpdated = { id: 1, status: 'resolved', admin_notes: 'Done' };
      db.query.mockResolvedValue({ rows: [mockUpdated] });

      const result = await Report.update(1, { status: 'resolved', adminNotes: 'Done' });
      expect(result).toEqual(mockUpdated);
    });

    it('should return the report via findById if no fields are updated', async () => {
      const mockExisting = { id: 1, issue: 'Nothing changed' };
      db.query.mockResolvedValue({ rows: [mockExisting] });

      const result = await Report.update(1, {});
      expect(result).toEqual(mockExisting);
    });

    it('should throw an error on failed update', async () => {
      db.query.mockRejectedValue(new Error('Update failed'));

      await expect(Report.update(1, { status: 'failed' })).rejects.toThrow('Update failed');
    });
  });

  describe('getWithDetails', () => {
    it('should return a detailed report if found', async () => {
      const mockDetails = { id: 1, reporter_email: 'a@example.com' };
      db.query.mockResolvedValue({ rows: [mockDetails] });

      const result = await Report.getWithDetails(1);
      expect(result).toEqual(mockDetails);
    });

    it('should return null if no report is found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Report.getWithDetails(999);
      expect(result).toBeNull();
    });

    it('should throw error on DB failure', async () => {
      db.query.mockRejectedValue(new Error('DB fail'));
      await expect(Report.getWithDetails(1)).rejects.toThrow('DB fail');
    });
  });

  describe('getAll', () => {
    it('should return all reports without filters', async () => {
      const mockReports = [{ id: 1 }, { id: 2 }];
      db.query.mockResolvedValue({ rows: mockReports });

      const result = await Report.getAll();
      expect(result).toEqual(mockReports);
    });

    it('should apply filters correctly', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await Report.getAll({
        status: 'pending',
        reportedBy: 1,
        reportedUser: 2,
        jobId: 3,
        orderByStatus: true,
      });

      expect(result).toEqual([{ id: 1 }]);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE'), expect.any(Array));
    });

    it('should throw error if query fails', async () => {
      db.query.mockRejectedValue(new Error('Query error'));

      await expect(Report.getAll()).rejects.toThrow('Query error');
    });
  });

  describe('getPendingReports', () => {
    it('should call getAll with status "pending"', async () => {
      const mockPending = [{ id: 1, status: 'pending' }];
      jest.spyOn(Report, 'getAll').mockResolvedValue(mockPending);

      const result = await Report.getPendingReports();
      expect(result).toEqual(mockPending);
      expect(Report.getAll).toHaveBeenCalledWith({
        status: 'pending',
        orderByStatus: true,
      });
    });
  });

  describe('countByStatus', () => {
    it('should return count for given status', async () => {
      db.query.mockResolvedValue({ rows: [{ count: '5' }] });

      const result = await Report.countByStatus('pending');
      expect(result).toBe(5);
    });

    it('should throw an error if query fails', async () => {
      db.query.mockRejectedValue(new Error('Count error'));

      await expect(Report.countByStatus('resolved')).rejects.toThrow('Count error');
    });
  });
});
