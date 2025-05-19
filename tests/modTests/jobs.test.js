const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const db = require('../../config/database');
const Job = require('../../models/Job');

jest.mock('../../config/database');

describe('Job Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a job if found', async () => {
      const mockJob = { id: 1, title: 'Test Job' };
      db.query.mockResolvedValue({ rows: [mockJob] });

      const result = await Job.findById(1);
      expect(result).toEqual(mockJob);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM jobs WHERE id = $1', [1]);
    });

    it('should return null if job not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Job.findById(99);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should insert and return the new job', async () => {
      const jobData = {
        clientId: 1,
        title: 'New Job',
        description: 'Description',
        requirements: 'Requirements',
        budget: 1000,
        deadline: '2025-06-01',
        status: 'pending',
        paymentStatus: 'unpaid'
      };

      const createdJob = { id: 1, ...jobData };
      db.query.mockResolvedValue({ rows: [createdJob] });

      const result = await Job.create(jobData);
      expect(result).toEqual(createdJob);
      expect(db.query).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update the job and return the updated job', async () => {
      const jobData = {
        title: 'Updated Job',
        description: 'Updated desc',
        budget: 2000
      };

      const updatedJob = { id: 1, ...jobData };
      db.query.mockResolvedValue({ rows: [updatedJob] });

      const result = await Job.update(1, jobData);
      expect(result).toEqual(updatedJob);
      expect(db.query).toHaveBeenCalled();
    });

    it('should return original job if no update fields provided', async () => {
      const originalJob = { id: 1, title: 'Original' };
      jest.spyOn(Job, 'findById').mockResolvedValue(originalJob);

      const result = await Job.update(1, {});
      expect(result).toEqual(originalJob);
    });
  });

  describe('delete', () => {
    it('should delete and return the deleted job', async () => {
      const deletedJob = { id: 1, title: 'Deleted Job' };
      db.query.mockResolvedValue({ rows: [deletedJob] });

      const result = await Job.delete(1);
      expect(result).toEqual(deletedJob);
    });

    it('should return null if nothing was deleted', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Job.delete(99);
      expect(result).toBeNull();
    });
  });

  describe('getApplications', () => {
    it('should return all job applications', async () => {
      const mockApps = [
        { id: 1, freelancer_id: 1, status: 'applied' },
        { id: 2, freelancer_id: 2, status: 'applied' }
      ];

      db.query.mockResolvedValue({ rows: mockApps });

      const result = await Job.getApplications(5);
      expect(result).toEqual(mockApps);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM job_applications'), [5]);
    });
  });

  describe('getOpenJobs', () => {
    it('should call getAll with status open', async () => {
      const mockJobs = [{ id: 1, status: 'open' }];
      jest.spyOn(Job, 'getAll').mockResolvedValue(mockJobs);

      const result = await Job.getOpenJobs();
      expect(result).toEqual(mockJobs);
      expect(Job.getAll).toHaveBeenCalledWith({ status: 'open' });
    });
  });
});
