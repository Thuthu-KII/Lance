/**
 * CSV Generator utility for creating invoice CSV files
 */
const fs = require('fs');
const path = require('path');

// Format currency
const formatCurrency = (amount) => {
  return parseFloat(amount).toFixed(2);
};

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toISOString().slice(0, 10);
};

// Generate invoice CSV content
exports.generateCsv = (job, freelancer) => {
  const today = formatDate(new Date());
  const invoiceNumber = `INV-${job.id}-${Date.now().toString().slice(-6)}`;
  
  // Build CSV content
  let csvContent = 'INVOICE\n';
  csvContent += `Date,${today}\n`;
  csvContent += `Invoice #,${invoiceNumber}\n\n`;
  
  csvContent += 'CLIENT DETAILS\n';
  csvContent += `Name,${job.client_first_name} ${job.client_last_name}\n`;
  if (job.company_name) csvContent += `Company,${job.company_name}\n`;
  csvContent += `Email,${job.client_email}\n`;
  if (job.client_phone) csvContent += `Phone,${job.client_phone}\n`;
  if (job.client_address) csvContent += `Address,${job.client_address.replace(/,/g, ' ')}\n\n`;
  
  if (freelancer) {
    csvContent += 'FREELANCER DETAILS\n';
    csvContent += `Name,${freelancer.first_name} ${freelancer.last_name}\n`;
    csvContent += `Email,${freelancer.email}\n`;
    if (freelancer.phone) csvContent += `Phone,${freelancer.phone}\n`;
    if (freelancer.address) csvContent += `Address,${freelancer.address.replace(/,/g, ' ')}\n\n`;
  }
  
  csvContent += 'JOB DETAILS\n';
  csvContent += `Job ID,${job.id}\n`;
  csvContent += `Title,${job.title.replace(/,/g, ' ')}\n`;
  csvContent += `Description,${job.description.replace(/\n/g, ' ').replace(/,/g, ' ')}\n`;
  csvContent += `Status,${job.status}\n`;
  if (job.deadline) csvContent += `Deadline,${formatDate(job.deadline)}\n`;
  csvContent += `Created,${formatDate(job.created_at)}\n\n`;
  
  csvContent += 'PAYMENT DETAILS\n';
  csvContent += `Amount,${formatCurrency(job.budget)}\n`;
  csvContent += `Payment Status,${job.payment_status}\n\n`;
  
  csvContent += 'SUMMARY\n';
  csvContent += 'Item,Description,Amount\n';
  csvContent += `Job: ${job.id},${job.title.replace(/,/g, ' ')},${formatCurrency(job.budget)}\n\n`;
  
  csvContent += `Total,${formatCurrency(job.budget)}\n\n`;
  
  csvContent += 'Thank you for using our platform!\n';
  csvContent += 'FreelanceHub - Connecting clients with professional freelancers\n';
  
  return csvContent;
};

// Save CSV to file (for storing invoices if needed)
exports.saveCsvToFile = (job, freelancer, directory = 'invoices') => {
  return new Promise((resolve, reject) => {
    try {
      const invoiceDir = path.join(__dirname, '..', 'public', directory);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }
      
      const invoiceNumber = `INV-${job.id}-${Date.now().toString().slice(-6)}`;
      const filePath = path.join(invoiceDir, `${invoiceNumber}.csv`);
      
      // Generate CSV content
      const csvContent = this.generateCsv(job, freelancer);
      
      // Write to file
      fs.writeFileSync(filePath, csvContent);
      
      resolve({
        success: true,
        filePath,
        invoiceNumber
      });
    } catch (error) {
      reject(error);
    }
  });
};