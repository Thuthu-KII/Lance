const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

module.exports = {
  generateInvoice: (job) => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const invoicePath = path.join(__dirname, '../../public/invoices', `invoice_${job.id}.pdf`);
        const stream = fs.createWriteStream(invoicePath);

        // Pipe the PDF to a file
        doc.pipe(stream);

        // Add invoice header
        doc.fontSize(20).text('Lancer Invoice', { align: 'center' });
        doc.moveDown();
        
        // Add job details
        doc.fontSize(14).text(`Job Title: ${job.title}`);
        doc.text(`Client: ${job.client_name}`);
        doc.text(`Amount: R${job.wage.toFixed(2)}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        
        // Add description
        doc.fontSize(12).text('Description:', { underline: true });
        doc.text(job.description);
        doc.moveDown();
        
        // Add footer
        doc.fontSize(10).text('Thank you for using Lancer!', { align: 'center' });

        // Finalize the PDF
        doc.end();

        stream.on('finish', () => {
          resolve(doc);
        });

        stream.on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
};