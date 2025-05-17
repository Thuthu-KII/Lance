/**
 * Generate a CSV file with job and user details
 * @param {Object} job - Job details
 * @param {Object} freelancer - Freelancer details (optional)
 * @returns {String} CSV content
 */
exports.generateCsv = (job, freelancer) => {
  const today = new Date().toISOString().slice(0, 10);
  
  // Format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
  };
  
  // Build CSV content
  let csvContent = 'INVOICE\n';
  csvContent += `Date,${today}\n`;
  csvContent += `Invoice #,INV-${job.id}-${Date.now().toString().slice(-6)}\n\n`;
  
  csvContent += 'CLIENT DETAILS\n';
  csvContent += `Name,${job.client_first_name} ${job.client_last_name}\n`;
  if (job.company_name) csvContent += `Company,${job.company_name}\n`;
  csvContent += `Email,${job.client_email}\n`;
  if (job.client_phone) csvContent += `Phone,${job.client_phone}\n`;
  if (job.client_address) csvContent += `Address,${job.client_address}\n\n`;
  
  if (freelancer) {
    csvContent += 'FREELANCER DETAILS\n';
    csvContent += `Name,${freelancer.first_name} ${freelancer.last_name}\n`;
    csvContent += `Email,${freelancer.email}\n`;
    if (freelancer.phone) csvContent += `Phone,${freelancer.phone}\n`;
    if (freelancer.address) csvContent += `Address,${freelancer.address}\n\n`;
  }
  
  csvContent += 'JOB DETAILS\n';
  csvContent += `Job ID,${job.id}\n`;
  csvContent += `Title,${job.title}\n`;
  csvContent += `Description,${job.description.replace(/\n/g, ' ')}\n`;
  csvContent += `Status,${job.status}\n`;
  if (job.deadline) csvContent += `Deadline,${new Date(job.deadline).toISOString().slice(0, 10)}\n`;
  csvContent += `Created,${new Date(job.created_at).toISOString().slice(0, 10)}\n\n`;
  
  csvContent += 'PAYMENT DETAILS\n';
  csvContent += `Amount,${formatCurrency(job.budget)}\n`;
  csvContent += `Payment Status,${job.payment_status}\n\n`;
  
  csvContent += 'SUMMARY\n';
  csvContent += 'Item,Description,Amount\n';
  csvContent += `Job: ${job.id},${job.title},${formatCurrency(job.budget)}\n\n`;
  
  csvContent += `Total,${formatCurrency(job.budget)}\n\n`;
  
  csvContent += 'Thank you for using our platform!\n';
  
  return csvContent;
};