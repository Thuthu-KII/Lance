// Toggle Sidebar Function
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

// Sample Jobs Data
const jobs = [
    {
        id: 1,
        clientName: "John Smith",
        jobTitle: "Website Development",
        description: "Create a responsive website for e-commerce",
        status: "In Progress",
        statusColor: "yellow"
    },
    {
        id: 2,
        clientName: "Sarah Johnson",
        jobTitle: "Logo Design",
        description: "Design modern logo for tech startup",
        status: "Completed",
        statusColor: "green"
    },
    {
        id: 3,
        clientName: "Mike Brown",
        jobTitle: "SEO Optimization",
        description: "Improve website ranking and visibility",
        status: "Pending",
        statusColor: "gray"
    }
];

// Handle Row Click
function handleRowClick(jobId) {
    console.log('Clicked job:', jobId);
    const row = document.querySelector(`[data-job-id="${jobId}"]`);
    row.classList.add('bg-gray-50');
    
    setTimeout(() => {
        window.location.href = `/job-details/${jobId}`;
    }, 300);
}

// Create Status Badge
function createStatusBadge(status, color) {
    const colors = {
        yellow: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
        green: 'bg-green-50 text-green-600 border border-green-200',
        gray: 'bg-gray-50 text-gray-600 border border-gray-200'
    };
    return `px-3 py-1 rounded-full text-xs font-medium ${colors[color]}`;
}

// Populate Table
function populateTable() {
    const tableBody = document.getElementById('tableBody');
    const loadingRow = document.getElementById('loadingRow');

    setTimeout(() => {
        loadingRow.remove();

        jobs.forEach(job => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors duration-150 cursor-pointer';
            row.setAttribute('data-job-id', job.id);
            row.setAttribute('onclick', `handleRowClick(${job.id})`);
            row.setAttribute('tabindex', '0');
            row.setAttribute('role', 'button');
            row.setAttribute('title', 'Click to view details');

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                            ${job.clientName.charAt(0)}
                        </div>
                        <div class="ml-3">
                            <p class="text-sm font-medium text-gray-800">${job.clientName}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <p class="text-sm text-gray-800">${job.jobTitle}</p>
                </td>
                <td class="px-6 py-4">
                    <p class="text-sm text-gray-600">${job.description}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="${createStatusBadge(job.status, job.statusColor)}">
                        ${job.status}
                    </span>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }, 1000);
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', populateTable);

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        const focusableRows = document.querySelectorAll('tr[tabindex="0"]');
        focusableRows.forEach(row => {
            row.addEventListener('focus', () => {
                row.classList.add('bg-gray-50');
            });
            row.addEventListener('blur', () => {
                row.classList.remove('bg-gray-50');
            });
        });
    }
});
