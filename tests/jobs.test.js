const {createJob, getJobs, updateStatus, fetchJobs, renderJobs, formatDate, updatePagination, getCurrentFilters, applyForJob} = require('../scripts/jobs')

global.fetch = jest.fn();
  
afterEach(() => {
    jest.clearAllMocks();
});

jest.mock('../scripts/jobs', () => {
    const original = jest.requireActual('../scripts/jobs');
    return {
      ...original,
      getJobs: jest.fn(),
      renderJobs: jest.fn(),
    };
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
    test('Updates job status', async () => {
        const testPayload = [{jobId: 1, status: 'Completed'}];
        const mockResponse = {success : true};

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const result = await updateStatus(testPayload);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/jobs/updateStatus'),
            expect.objectContaining({
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(testPayload),
            })
          );

          expect(result).toEqual(mockResponse);
    });
});

beforeEach(() => {
    document.body.innerHTML = `
      <div id="loadingState" class="hidden"></div>
      <div id="jobsList" class="hidden"></div>
      <div id="emptyState" class="hidden">
        <h3></h3>
        <p></p>
      </div>
      <div id="pagination" class="hidden"></div>
    `;
  });

describe('fetchJobs', () => {
    test('fetches and renders jobs from the database', async () => {
        const jobs = [{ jobId: 1, jobTitle: 'Test Job', category: 'plumbing', wage: 500, duration: '2h', description: 'Fix sink', location: 'Joburg', createdAt: new Date().toISOString() }];
        getJobs.mockResolvedValueOnce(jobs);

        await fetchJobs();

        expect(document.getElementById('loadingState').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('jobsList').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('emptyState').classList.contains('hidden')).toBe(true);

        expect(renderJobs).toHaveBeenCalledWith(jobs);
    });

    test('fetchJobs shows emptyState on error', async () => {
        getJobs.mockRejectedValueOnce(new Error('Network error'));
      
        await fetchJobs();
      
        expect(document.getElementById('loadingState').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('emptyState').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('emptyState').querySelector('h3').textContent).toBe("Error loading jobs");
    });
});

describe('formatDate', () => {
    const now = new Date();

    test('returns "today" for current date', async () => {
        const today = now.toISOString;
        expect(formatDate(today)).toBe('today')
    });

    test('returns "yesterday" for 1 day ago', () => {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        expect(formatDate(yesterday.toISOString())).toBe('yesterday');
      });
    
      test('returns "5 days ago" for 5 days ago', () => {
        const fiveDaysAgo = new Date(now);
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        expect(formatDate(fiveDaysAgo.toISOString())).toBe('5 days ago');
      });
});

describe('updatePagination', () => {
    beforeEach(() => {
      // Setup DOM elements
      document.body.innerHTML = `
        <div id="pageInfo"></div>
        <button id="prevPage"></button>
        <button id="nextPage"></button>
      `;
    });
  
    test('correctly updates page text and enables/disables buttons', () => {
      updatePagination(1, 5);
  
      expect(document.getElementById('pageInfo').textContent).toBe('Page 1 of 5');
      expect(document.getElementById('prevPage').disabled).toBe(true);  // disabled on first page
      expect(document.getElementById('nextPage').disabled).toBe(false); // enabled
  
      updatePagination(5, 5);
  
      expect(document.getElementById('prevPage').disabled).toBe(false); // enabled
      expect(document.getElementById('nextPage').disabled).toBe(true);  // disabled on last page
    });
  
    test('adds correct click handlers', () => {
      // Mock the fetchJobs and getCurrentFilters functions
      global.fetchJobs = jest.fn();
      global.getCurrentFilters = jest.fn(() => ({ category: 'plumbing' }));
  
      updatePagination(2, 5);
  
      document.getElementById('prevPage').click();
      expect(fetchJobs).toHaveBeenCalledWith(1, { category: 'plumbing' });
  
      document.getElementById('nextPage').click();
      expect(fetchJobs).toHaveBeenCalledWith(3, { category: 'plumbing' });
    });
  });

  describe('getCurrentFilters', () => {
    beforeEach(() => {
      // Set up the DOM with relevant input fields
      document.body.innerHTML = `
        <input id="jobSearch" value="developer" />
        <select id="categoryFilter">
          <option value="plumbing">Plumbing</option>
          <option value="coding" selected>Coding</option>
        </select>
        <select id="budgetFilter">
          <option value="low">Low</option>
          <option value="high" selected>High</option>
        </select>
      `;
    });
  
    test('returns the correct filter values', () => {
      const filters = getCurrentFilters();
      expect(filters).toEqual({
        search: 'developer',
        category: 'coding',
        budget: 'high'
      });
    });
  });

  describe('applyForJob', () => {
    beforeEach(() => {
      // Mock window.location
      delete window.location;
      window.location = { href: '' };
      jest.useFakeTimers(); // Use fake timers for setTimeout
    });
  
    afterEach(() => {
      jest.useRealTimers();
    });
  
    test('redirects to job details page after 300ms', () => {
      applyForJob(42);
  
      // Fast-forward time
      jest.advanceTimersByTime(300);
  
      expect(window.location.href).toBe('/jobdetails?jobId=42');
    });
  });
  