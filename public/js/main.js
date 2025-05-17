document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI components
  initSidebarToggle();
  initFileUploads();
  initFormValidations();
  initPaymentHandlers();
});

function initSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggleBtn = document.getElementById('sidebar-toggle');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('hidden');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    });
  }
}

function initFileUploads() {
  const fileInputs = document.querySelectorAll('input[type="file"]');
  
  fileInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const feedback = document.getElementById(`${input.id}-feedback`);
      
      if (file) {
        const validTypes = ['application/pdf', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type)) {
          feedback.textContent = 'Error: Only PDF and DOCX files are allowed';
          feedback.classList.add('text-red-500');
          input.value = '';
          return;
        }
        
        if (file.size > maxSize) {
          feedback.textContent = 'Error: File size exceeds 5MB limit';
          feedback.classList.add('text-red-500');
          input.value = '';
          return;
        }
        
        feedback.textContent = `Selected: ${file.name}`;
        feedback.classList.remove('text-red-500');
        feedback.classList.add('text-green-500');
      }
    });
  });
}

function initFormValidations() {
  const forms = document.querySelectorAll('form[data-validate]');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      let isValid = true;
      const inputs = form.querySelectorAll('[required]');
      
      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.classList.add('border-red-500');
          isValid = false;
        } else {
          input.classList.remove('border-red-500');
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        const errorMsg = form.querySelector('.form-error') || 
          document.createElement('div');
        errorMsg.textContent = 'Please fill in all required fields';
        errorMsg.classList.add('form-error', 'text-red-500', 'mt-2');
        form.appendChild(errorMsg);
      }
    });
  });
}

function initPaymentHandlers() {
  const paymentButtons = document.querySelectorAll('[data-payment-init]');
  
  paymentButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const jobId = button.dataset.jobId;
      
      try {
        button.disabled = true;
        button.textContent = 'Processing...';
        
        const response = await fetch(`/payments/initiate/${jobId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          throw new Error('Payment initiation failed');
        }
      } catch (err) {
        console.error(err);
        button.disabled = false;
        button.textContent = 'Try Again';
        alert('Payment initiation failed. Please try again.');
      }
    });
  });
}

// API helper functions
async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

async function postJSON(url, data) {
  return fetchJSON(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}