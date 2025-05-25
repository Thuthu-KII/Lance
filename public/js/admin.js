/**
 * Admin dashboard functionality
 */
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the admin dashboard
  const adminDashboard = document.getElementById('admin-dashboard');
  if (!adminDashboard) return;
  
  // Initialize charts if Chart.js is available
  if (typeof Chart !== 'undefined') {
    // User registration chart
    const userChartCanvas = document.getElementById('userRegistrationChart');
    if (userChartCanvas) {
      const userChartData = JSON.parse(userChartCanvas.dataset.chartData || '[]');
      
      new Chart(userChartCanvas, {
        type: 'line',
        data: {
          labels: userChartData.map(item => item.month),
          datasets: [
            {
              label: 'New Users',
              data: userChartData.map(item => item.count),
              borderColor: '#3498db',
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              borderWidth: 2,
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    }
    
    // Job statistics chart
    const jobChartCanvas = document.getElementById('jobStatisticsChart');
    if (jobChartCanvas) {
      const jobChartData = JSON.parse(jobChartCanvas.dataset.chartData || '[]');
      
      new Chart(jobChartCanvas, {
        type: 'bar',
        data: {
          labels: jobChartData.map(item => item.month),
          datasets: [
            {
              label: 'Jobs Posted',
              data: jobChartData.map(item => item.count),
              backgroundColor: '#2ecc71',
              borderColor: '#27ae60',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    }
    
    // Payment statistics chart
    const paymentChartCanvas = document.getElementById('paymentStatisticsChart');
    if (paymentChartCanvas) {
      const paymentChartData = JSON.parse(paymentChartCanvas.dataset.chartData || '[]');
      
      new Chart(paymentChartCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Client Payments', 'Freelancer Payouts', 'Platform Fees'],
          datasets: [
            {
              data: [
                paymentChartData.clientPayments || 0,
                paymentChartData.freelancerPayments || 0,
                paymentChartData.platformFees || 0
              ],
              backgroundColor: [
                '#3498db',
                '#2ecc71',
                '#f39c12'
              ],
              borderColor: '#ffffff',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }
  
  // User search functionality
  const userSearchInput = document.getElementById('userSearch');
  if (userSearchInput) {
    userSearchInput.addEventListener('keyup', function() {
      const searchValue = this.value.toLowerCase();
      const userRows = document.querySelectorAll('#usersTable tbody tr');
      
      userRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchValue) ? '' : 'none';
      });
    });
  }
  
  // Admin quick filters
  const quickFilterButtons = document.querySelectorAll('.quick-filter');
  if (quickFilterButtons.length > 0) {
    quickFilterButtons.forEach(button => {
      button.addEventListener('click', function() {
        const filterValue = this.dataset.filter;
        const tableId = this.dataset.tableTarget;
        const table = document.getElementById(tableId);
        
        if (!table) return;
        
        const rows = table.querySelectorAll('tbody tr');
        
        if (filterValue === 'all') {
          rows.forEach(row => row.style.display = '');
        } else {
          rows.forEach(row => {
            const status = row.dataset.status;
            row.style.display = status === filterValue ? '' : 'none';
          });
        }
        
        // Update active filter
        quickFilterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }
  
  // Confirmation dialogs for critical actions
  const confirmActionForms = document.querySelectorAll('form[data-confirm]');
  if (confirmActionForms.length > 0) {
    confirmActionForms.forEach(form => {
      form.addEventListener('submit', function(e) {
        const confirmMessage = this.dataset.confirm;
        if (!confirm(confirmMessage)) {
          e.preventDefault();
          return false;
        }
      });
    });
  }
  
  // Date range filters
  const dateRangeForm = document.getElementById('dateRangeForm');
  if (dateRangeForm) {
    dateRangeForm.addEventListener('submit', function(e) {
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
      
      if (startDate && endDate) {
        // Form will submit normally with date parameters
      } else {
        e.preventDefault();
        alert('Please select both start and end dates');
      }
    });
  }
});