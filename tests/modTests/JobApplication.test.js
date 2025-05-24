const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const JobApplication = require('../../models/JobApplication');
const db = require('../../config/database');

jest.mock('../../config/database');

describe('JobApplication Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns application if found', async () => {
      const fakeApp = { id: 1 };
      db.query.mockResolvedValue({ rows: [fakeApp] });

      const result = await JobApplication.findById(1);
      expect(result).toEqual(fakeApp);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM job_applications WHERE id = $1', [1]);
    });

    it('returns null if not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const result = await JobApplication.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('findByJobAndFreelancer', () => {
    it('returns application if found', async () => {
      const app = { job_id: 1, freelancer_id: 2 };
      db.query.mockResolvedValue({ rows: [app] });

      const result = await JobApplication.findByJobAndFreelancer(1, 2);
      expect(result).toEqual(app);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM job_applications WHERE job_id = $1 AND freelancer_id = $2',
        [1, 2]
      );
    });

    it('returns null if not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const result = await JobApplication.findByJobAndFreelancer(1, 99);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates a new application if none exists', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] }) // for findByJobAndFreelancer
        .mockResolvedValueOnce({ rows: [{ id: 123 }] }); // for insert

      const input = { jobId: 1, freelancerId: 2, motivation: 'I want to apply' };
      const result = await JobApplication.create(input);

      expect(result).toEqual({ id: 123 });
      expect(db.query).toHaveBeenCalledTimes(2);
    });

    it('throws an error if application exists', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // existing application

      await expect(
        JobApplication.create({ jobId: 1, freelancerId: 2, motivation: 'test' })
      ).rejects.toThrow('You have already applied for this job');
    });
  });

  describe('update', () => {
    it('updates application with given fields', async () => {
      const updatedApp = { id: 1, motivation: 'Updated' };
      db.query.mockResolvedValue({ rows: [updatedApp] });

      const result = await JobApplication.update(1, { motivation: 'Updated' });
      expect(result).toEqual(updatedApp);
      expect(db.query).toHaveBeenCalled();
    });

    it('returns application as-is if no fields to update', async () => {
      const original = { id: 1, motivation: 'Original' };
      db.query.mockResolvedValue({ rows: [original] });

      const result = await JobApplication.update(1, {});
      expect(result).toEqual(original);
    });
  });

  describe('getWithDetails', () => {
    it('returns application with details', async () => {
      const details = { id: 1, job_title: 'Developer' };
      db.query.mockResolvedValue({ rows: [details] });

      const result = await JobApplication.getWithDetails(1);
      expect(result).toEqual(details);
      expect(db.query).toHaveBeenCalled();
    });

    it('returns null if not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const result = await JobApplication.getWithDetails(999);
      expect(result).toBeNull();
    });
  });

  describe('getByJobId', () => {
    it('returns list of applications for job', async () => {
      const apps = [{ id: 1 }, { id: 2 }];
      db.query.mockResolvedValue({ rows: apps });

      const result = await JobApplication.getByJobId(10);
      expect(result).toEqual(apps);
    });
  });

  describe('getByFreelancerId', () => {
    it('returns list of applications by freelancer', async () => {
      const apps = [{ id: 1 }, { id: 2 }];
      db.query.mockResolvedValue({ rows: apps });

      const result = await JobApplication.getByFreelancerId(7);
      expect(result).toEqual(apps);
    });
  });

  describe('getHiredApplication', () => {
    it('returns hired application for job', async () => {
      const app = { id: 1, status: 'hired' };
      db.query.mockResolvedValue({ rows: [app] });

      const result = await JobApplication.getHiredApplication(5);
      expect(result).toEqual(app);
    });

    it('returns null if none hired', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const result = await JobApplication.getHiredApplication(5);
      expect(result).toBeNull();
    });
  });

  describe('count', () => {
    it('counts applications with no filters', async () => {
      db.query.mockResolvedValue({ rows: [{ count: '4' }] });

      const result = await JobApplication.count();
      expect(result).toBe(4);
      expect(db.query).toHaveBeenCalledWith('SELECT COUNT(*) FROM job_applications', []);
    });

    it('counts applications with filters', async () => {
      db.query.mockResolvedValue({ rows: [{ count: '2' }] });

      const result = await JobApplication.count({ jobId: 1, status: 'pending' });
      expect(result).toBe(2);
    });
  });
});
