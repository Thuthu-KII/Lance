/**
 * Client-side payment processing
 */
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on a payment page
  const paymentForm = document.getElementById('payment-form');
  if (!paymentForm) return;
  
  const jobId = window.location.pathname.split('/').pop();
  const payButton = document.getElementById('pay-button');
  const paymentProcessing = document.getElementById('payment-processing');
  const paymentSuccess = document.getElementById('payment-success');
  const paymentError = document.getElementById('payment-error');
  
  // Initialize Yoco SDK
  const yoco = new window.YocoSDK({
    publicKey: document.getElementById('yoco-public-key').value
  });
  
  // Create the card frame
  const cardFrame = yoco.inline({
    element: '#card-frame',
    layout: 'standard'
  });
  
  // Handle payment submission
  payButton.addEventListener('click', function(event) {
    event.preventDefault();
    
    // Validate form fields if applicable
    
    // Disable button and show processing state
    payButton.disabled = true;
    paymentProcessing.classList.remove('d-none');
    paymentError.textContent = '';
    
    // Process payment with Yoco
    yoco.tokenize({
      name: document.getElementById('cardholder-name').value || 'Cardholder',
      callback: async function(result) {
        if (result.error) {
          payButton.disabled = false;
          paymentProcessing.classList.add('d-none');
          paymentError.textContent = result.error.message;
          return;
        }
        
        // Send token to server
        try {
          const response = await fetch(`/payments/job/${jobId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': document.getElementById('csrf-token').value
            },
            body: JSON.stringify({
              token: result.id
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            paymentForm.classList.add('d-none');
            paymentSuccess.classList.remove('d-none');
            
            // Redirect after 3 seconds
            setTimeout(() => {
              window.location.href = '/client/jobs';
            }, 3000);
          } else {
            payButton.disabled = false;
            paymentProcessing.classList.add('d-none');
            paymentError.textContent = data.message || 'Payment failed. Please try again.';
          }
        } catch (error) {
          payButton.disabled = false;
          paymentProcessing.classList.add('d-none');
          paymentError.textContent = 'An error occurred. Please try again.';
        }
      }
    });
  });
});