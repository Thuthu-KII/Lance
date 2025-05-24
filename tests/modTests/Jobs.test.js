const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const Job = require('../../models/Job');
const db = require('../../config/database');

// Mock db.query and db.getClient
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  getClient: jest.fn()
}));

describe('Job Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a job by ID', async () => {
      const mockJob = { id: 1, title: 'Test Job' };
      db.query.mockResolvedValue({ rows: [mockJob] });

      const result = await Job.findById(1);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM jobs WHERE id = $1', [1]);
      expect(result).toEqual(mockJob);
    });
  });

  describe('create', () => {
    it('should create a new job', async () => {
      const jobData = {
        clientId: 1,
        title: 'New Job',
        description: 'Desc',
        requirements: 'Skills',
        budget: 1000,
        deadline: '2025-12-31',
        status: 'open',
        paymentStatus: 'paid'
      };
      const mockCreated = { ...jobData, id: 1 };
      db.query.mockResolvedValue({ rows: [mockCreated] });

      const result = await Job.create(jobData);
      expect(result).toEqual(mockCreated);
    });
  });

  describe('update', () => {
    it('should update a job and return updated record', async () => {
      const updatedJob = { id: 1, title: 'Updated Title' };
      db.query.mockResolvedValue({ rows: [updatedJob] });

      const result = await Job.update(1, { title: 'Updated Title' });
      expect(result).toEqual(updatedJob);
    });

    it('should return original job if no fields to update', async () => {
      const job = { id: 1, title: 'No Update' };
      db.query.mockResolvedValue({ rows: [job] });

      const result = await Job.update(1, {});
      expect(result).toEqual(job);
    });
  });

  describe('delete', () => {
    it('should delete a job by ID', async () => {
      const job = { id: 1 };
      db.query.mockResolvedValue({ rows: [job] });

      const result = await Job.delete(1);
      expect(result).toEqual(job);
    });
  });

  describe('getWithClientDetails', () => {
    it('should return job with client details', async () => {
      const mockResult = { id: 1, client_first_name: 'John' };
      db.query.mockResolvedValue({ rows: [mockResult] });

      const result = await Job.getWithClientDetails(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getApplications', () => {
    it('should return applications for a job', async () => {
      const apps = [{ id: 1, freelancer_id: 2 }];
      db.query.mockResolvedValue({ rows: apps });

      const result = await Job.getApplications(1);
      expect(result).toEqual(apps);
    });
  });

  describe('getAll', () => {
    it('should return all jobs', async () => {
      const jobs = [{ id: 1 }, { id: 2 }];
      db.query.mockResolvedValue({ rows: jobs });

      const result = await Job.getAll();
      expect(result).toEqual(jobs);
    });

    it('should apply filters when provided', async () => {
      const jobs = [{ id: 3 }];
      db.query.mockResolvedValue({ rows: jobs });

      const filters = { status: 'open', limit: 1 };
      const result = await Job.getAll(filters);
      expect(result).toEqual(jobs);
    });
  });

  describe('hireFreelancer', () => {
    it('should hire a freelancer and update job/application states', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // Update application
        .mockResolvedValueOnce() // Update job
        .mockResolvedValueOnce() // Insert job completion
        .mockResolvedValueOnce() // Reject others
        .mockResolvedValueOnce(); // COMMIT

      db.getClient.mockResolvedValue(mockClient);

      const result = await Job.hireFreelancer(1, 5);
      expect(result).toBe(true);
      expect(mockClient.query).toHaveBeenCalledTimes(6);
    });

    it('should rollback on failure', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockRejectedValueOnce(new Error('fail')); // Fail on update application

      db.getClient.mockResolvedValue(mockClient);

      await expect(Job.hireFreelancer(1, 5)).rejects.toThrow('fail');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('markCompleteByClient / Freelancer', () => {
    beforeEach(() => {
      db.query.mockReset();
    });

    it('should complete job if both confirmed (client)', async () => {
      db.query
        .mockResolvedValueOnce() // Update job_completions
        .mockResolvedValueOnce({ rows: [{ freelancer_confirmed: true }] }) // Select
        .mockResolvedValueOnce() // Update jobs
        .mockResolvedValueOnce(); // Update job_completions

      const result = await Job.markCompleteByClient(1);
      expect(result).toBe(true);
    });

    it('should complete job if both confirmed (freelancer)', async () => {
      db.query
        .mockResolvedValueOnce() // Update job_completions
        .mockResolvedValueOnce({ rows: [{ client_confirmed: true }] }) // Select
        .mockResolvedValueOnce() // Update jobs
        .mockResolvedValueOnce(); // Update job_completions

      const result = await Job.markCompleteByFreelancer(1);
      expect(result).toBe(true);
    });
  });

  describe('getCompletionStatus', () => {
    it('should return completion status for job', async () => {
      const row = { job_id: 1, completed_at: null };
      db.query.mockResolvedValue({ rows: [row] });

      const result = await Job.getCompletionStatus(1);
      expect(result).toEqual(row);
    });
  });
});
