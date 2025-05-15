const url = 'https://lance-api-ftcehba3hhheg9hu.southafricanorth-01.azurewebsites.net'; //await

async function createJob(jobData) {
    const res = await fetch(`${url}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
  
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create job: ${errorText}`);
    }
  
    return await res.json();
  }
  
async function getJobs() {
    const res = await fetch(`${url}/jobs`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return await res.json();
  }


 async function updateStatus(info){
    const res = await fetch(`${url}/jobs/updateStatus`,{
      method : 'POST',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify(info)

    });
    if(!res.ok){
      const errorText = await res.text();
      throw new Error(`Failed to update job status: ${errorText}`);
    }
    return await res.json();
  }

 // Function to fetch jobs from the server
 async function fetchJobs(page = 1, filters = {}) {
    try {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('jobsList').classList.add('hidden');
        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('pagination').classList.add('hidden');

        const jobs = await getJobs(); // jobs is an array
        console.log("Fetched jobs:", jobs); // for debugging

        renderJobs(jobs);

        if (jobs.length === 0) {
            document.getElementById('emptyState').classList.remove('hidden');
        } else {
            document.getElementById('jobsList').classList.remove('hidden');
        }

    } catch (error) {
        console.error('Error fetching jobs:', error);
        document.getElementById('emptyState').classList.remove('hidden');
        document.getElementById('emptyState').querySelector('h3').textContent = "Error loading jobs";
        document.getElementById('emptyState').querySelector('p').textContent = "Please try again later";
    } finally {
        document.getElementById('loadingState').classList.add('hidden');
    }
}


// Function to render jobs
function renderJobs(jobs) {
    const jobsList = document.getElementById('jobsList');
    const template = document.getElementById('jobTemplate');
    
    // Clear existing jobs
    jobsList.innerHTML = '';
    
    // Add each job to the list
    jobs.forEach(job => {
        const clone = template.content.cloneNode(true);
        
        // Fill in the job data
        clone.querySelector('.job-title').textContent = job.jobTitle;
        clone.querySelector('.job-category').textContent = job.category.replace('-', ' ');//====
        clone.querySelector('.job-budget').textContent = job.wage;
        clone.querySelector('.job-duration').textContent = job.duration;
        clone.querySelector('.job-description').textContent = job.description;
        clone.querySelector('.job-location').textContent = job.location;//========
        clone.querySelector('.job-posted').textContent = `Posted ${formatDate(job.createdAt)}`;
        
        // Add click handler for apply button
        clone.querySelector('.apply-btn').addEventListener('click', () => {
            applyForJob(job.jobId);
        });
        
        jobsList.appendChild(clone);
    });
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "today";
    if (diffInDays === 1) return "yesterday";
    return `${diffInDays} days ago`;
}

// Function to update pagination
function updatePagination(currentPage, totalPages) {
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
    
    // Update click handlers
    prevButton.onclick = () => {
        if (currentPage > 1) {
            fetchJobs(currentPage - 1, getCurrentFilters());
        }
    };
    
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            fetchJobs(currentPage + 1, getCurrentFilters());
        }
    };
}

// Function to get current filter values
function getCurrentFilters() {
    return {
        search: document.getElementById('jobSearch').value,
        category: document.getElementById('categoryFilter').value,
        budget: document.getElementById('budgetFilter').value
    };
}

// Function to handle job application
// Should change to Job Details instead
function applyForJob(jobId) {
setTimeout(() => {
window.location.href = `/jobdetails?jobId=${jobId}`;
}, 300);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch
    fetchJobs();
    
    // Set up filter button
    document.getElementById('applyFilters').addEventListener('click', () => {
        fetchJobs(1, getCurrentFilters());
    });
    
    // Set up search input (debounced)
    let searchTimeout;
    document.getElementById('jobSearch').addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchJobs(1, getCurrentFilters());
        }, 500);
    });
    
    // Set up sidebar toggle (if needed)
    window.toggleSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
        } else {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        }
    };
});

module.exports = {createJob, getJobs, updateStatus, fetchJobs, renderJobs, formatDate, updatePagination, getCurrentFilters, applyForJob};