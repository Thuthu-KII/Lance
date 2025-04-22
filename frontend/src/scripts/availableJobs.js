// Toggle Sidebar Function
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

// Sample Jobs Data
const availableJobs = [
    {   
        jobId: "0",
        jobTitle: "Senior Software Engineer",
        clientName: "TechWiz",
        location: "JHB, Braamfontein",
        price: "R200/hr"
    },
    {   
        jobId: "0",
        jobTitle: "Senior Software Engineer",
        clientName: "TechWiz",
        location: "JHB, Braamfontein",
        price: "R200/hr"
    },
    {   
        jobId: "0",
        jobTitle: "Senior Software Engineer",
        clientName: "TechWiz",
        location: "JHB, Braamfontein",
        price: "R200/hr"
    },
    {   
        jobId: "0",
        jobTitle: "Senior Software Engineer",
        clientName: "TechWiz",
        location: "JHB, Braamfontein",
        price: "R200/hr"
    }
];

// Handle card Click
function handlecardClick(jobId) {
    console.log('Clicked job:', jobId);
    const card = document.querySelector(`[data-job-id="${jobId}"]`);
    card.classList.add('bg-gray-50');
    
    setTimeout(() => {
        window.location.href = `/job-details/${jobId}`;
    }, 300);
}

// Populate Table
function populateTable() {
    const jobGrid = document.getElementById('jobGrid');
    const loadingCard = document.getElementById('loadingCard');

    setTimeout(() => {
        loadingCard.remove();

        availableJobs.forEach(job => {
            const card = document.createElement('card');
            card.className = 'glass-effect rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer';
            card.setAttribute('data-job-id', job.jobId);
            card.setAttribute('onclick', `handlecardClick(${job.jobId})`);
            card.setAttribute('title', 'Click to view details');

            card.innerHTML = `
                <section class="flex justify-between items-start mb-4">
                    <section class="flex items-center space-x-3">
                        <section class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            ${job.jobId}
                        </section>
                        <section>
                            <h3 class="font-semibold text-gray-800">${job.jobTitle}</h3>
                            <p class="text-sm text-gray-500">${job.clientName}</p>
                            <p class="text-sm text-gray-500">${job.location}</p>
                            <p class="text-sm text-gray-500">${job.price}</p>
                        </section>
                    </section>
                    <button class="text-primary-500 hover:text-primary-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                    </button>
                </section>                
            `;

            jobGrid.appendChild(card);
        });
    }, 1000);
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', populateTable);

