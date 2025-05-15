const {createJob, getJobs, updateStatus, fetchJobs, renderJobs, formatDate, updatePagination, getCurrentFilters, applyForJob} = require('../scripts/jobs')

global.fetch = jest.fn();
  
afterEach(() => {
    jest.clearAllMocks();
});

describe('createJob', () => {
    //Successful job creation test
    test('Creates job data', async() => {
        const inputJob1 = [{ jobTitle: 'Buff coder'}];
        const responseJob = [{jobId: 1, jobTitle: 'Buff coder'}];

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => responseJob,
        });

        const result = await createJob(inputJob1);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/jobs'),
            expect.objectContaining({
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(inputJob1)
            })
        );
        expect(result).toEqual(responseJob)
    })
    //Unsuccessful job creation
    test('Throws error if job creation fails', async() => {
        fetch.mockResolvedValueOnce({
            ok: false,
            text: async () => 'error'
        });

        await expect(createJob({jobTitle: 'Electrician'})).rejects.toThrow('Failed to create job: error');
    }); 
});
  
describe('getJobs', () => {
    test('Returns job data', async () => {
      const TestJob2 = [{ jobId: 2, jobTitle: 'Plumber' }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => TestJob2,
    });
  
    const data = await getJobs();
    expect(data).toEqual(TestJob2);
    });
  
    test('Throws error when fetch fails', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
  
    await expect(getJobs()).rejects.toThrow('Failed to fetch jobs');
    });
  });

describe('updateStatus',() => {

})
  