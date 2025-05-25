const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const db = require('../../config/database');
const Freelancer = require('../../models/Freelancer');

jest.mock('../../config/database');

describe('Freelancer Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return a freelancer if found by user ID', async () => {
      const mockFreelancer = { id: 1, user_id: 123 };
      db.query.mockResolvedValue({ rows: [mockFreelancer] });

      const result = await Freelancer.findByUserId(123);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM freelancers WHERE user_id = $1',
        [123]
      );
      expect(result).toEqual(mockFreelancer);
    });

    it('should return null if freelancer not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Freelancer.findByUserId(999);
      expect(result).toBeNull();
    });

    it('should throw error if db query fails', async () => {
      db.query.mockRejectedValue(new Error('DB error'));

      await expect(Freelancer.findByUserId(123)).rejects.toThrow('DB error');
    });
  });

  describe('create', () => {
    it('should insert and return new freelancer', async () => {
      const data = {
        userId: 1,
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '123456789',
        address: '123 Street',
        skills: 'JS, Node',
        experience: '3 years',
        cvPath: '/cv.pdf',
        clearancePath: '/clearance.pdf',
      };
      const inserted = { id: 10, ...data, is_approved: false };
      db.query.mockResolvedValue({ rows: [inserted] });

      const result = await Freelancer.create(data);
      expect(db.query).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
      expect(result).toEqual(inserted);
    });

    it('should throw error if db query fails', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const data = {
        userId: 1,
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '123456789',
        address: '123 Street',
        skills: 'JS, Node',
        experience: '3 years',
        cvPath: '/cv.pdf',
        clearancePath: '/clearance.pdf',
      };

      await expect(Freelancer.create(data)).rejects.toThrow('DB error');
    });
  });

  describe('update', () => {
    it('should update fields and return updated freelancer', async () => {
      const id = 1;
      const updateData = { firstName: 'Updated', phone: '987654321' };
      const updatedFreelancer = { id, ...updateData };
      db.query.mockResolvedValue({ rows: [updatedFreelancer] });

      const result = await Freelancer.update(id, updateData);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE freelancers SET'), expect.any(Array));
      expect(result).toEqual(updatedFreelancer);
    });

    it('should skip update if no fields provided', async () => {
      const existing = { id: 1, first_name: 'Original' };
      jest.spyOn(Freelancer, 'findById').mockResolvedValue(existing);

      const result = await Freelancer.update(1, {});
      expect(result).toEqual(existing);
    });

    it('should throw error if db query fails', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const id = 1;
      const updateData = { firstName: 'Updated' };

      await expect(Freelancer.update(id, updateData)).rejects.toThrow('DB error');
    });
  });

  describe('approve', () => {
    it('should approve a freelancer', async () => {
      const id = 5;
      const approvedFreelancer = { id, is_approved: true };
      db.query.mockResolvedValue({ rows: [approvedFreelancer] });

      const result = await Freelancer.approve(id);
      expect(result).toEqual(approvedFreelancer);
    });

    it('should throw error if db query fails', async () => {
      db.query.mockRejectedValue(new Error('DB error'));

      await expect(Freelancer.approve(5)).rejects.toThrow('DB error');
    });
  });

  describe('getWithUserDetails', () => {
    it('should join freelancer with user details', async () => {
      const joined = { id: 1, email: 'freelancer@example.com' };
      db.query.mockResolvedValue({ rows: [joined] });

      const result = await Freelancer.getWithUserDetails(1);
      expect(result).toEqual(joined);
    });

    it('should throw error if db query fails', async () => {
      db.query.mockRejectedValue(new Error('DB error'));

      await expect(Freelancer.getWithUserDetails(1)).rejects.toThrow('DB error');
    });
  });

  describe('getAll', () => {
    it('should get all freelancers optionally filtered by approval', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });

      const result = await Freelancer.getAll({ approved: true });
      expect(result.length).toBe(2);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE f.is_approved'), expect.any(Array));
    });

    it('should throw error if db query fails', async () => {
      db.query.mockRejectedValue(new Error('DB error'));

      await expect(Freelancer.getAll({ approved: true })).rejects.toThrow('DB error');
    });
  });

  describe('getPendingApprovals', () => {
    it('should get unapproved freelancers', async () => {
      const pending = [{ id: 1, is_approved: false }];
      jest.spyOn(Freelancer, 'getAll').mockResolvedValue(pending);

      const result = await Freelancer.getPendingApprovals();
      expect(result).toEqual(pending);
    });

    it('should throw error if getAll fails', async () => {
      jest.spyOn(Freelancer, 'getAll').mockRejectedValue(new Error('DB error'));

      await expect(Freelancer.getPendingApprovals()).rejects.toThrow('DB error');
    });
  });

  describe('count', () => {
    it('should count all freelancers', async () => {
      db.query.mockResolvedValue({ rows: [{ count: '7' }] });

      const result = await Freelancer.count();
      expect(result).toBe(7);
    });

    it('should count only approved freelancers', async () => {
      db.query.mockResolvedValue({ rows: [{ count: '3' }] });

      const result = await Freelancer.count(true);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT COUNT(*) FROM freelancers WHERE is_approved = $1',
        [true]
      );
      expect(result).toBe(3);
    });

    it('should throw error if db query fails', async () => {
      db.query.mockRejectedValue(new Error('DB error'));

      await expect(Freelancer.count()).rejects.toThrow('DB error');
    });
  });

  describe('getApplications', () => {
    it('should fetch job applications for freelancer', async () => {
      const apps = [{ id: 1, job_id: 2 }];
      db.query.mockResolvedValue({ rows: apps });

      const result = await Freelancer.getApplications(1);
      expect(result).toEqual(apps);
    });

    it('should throw error if db query fails', async () => {
      db.query.mockRejectedValue(new Error('DB error'));

      await expect(Freelancer.getApplications(1)).rejects.toThrow('DB error');
    });
  });

  describe('getHiredJobs', () => {
    it('should fetch hired jobs for freelancer', async () => {
      const jobs = [{ id: 1, status: 'hired' }];
      db.query.mockResolvedValue({ rows: jobs });

      const result = await Freelancer.getHiredJobs(1);
      expect(result).toEqual(jobs);
    });

    it('should throw error if db query fails', async () => {
      db.query.mockRejectedValue(new Error('DB error'));

      await expect(Freelancer.getHiredJobs(1)).rejects.toThrow('DB error');
    });
  });
});
