const PDFDocument = require('pdfkit');
exports.generate = async (req, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition','attachment; filename=invoice.pdf');
  doc.text(`Invoice for Job ${req.query.jobId}`);
  // ... more details
  doc.end();
  doc.pipe(res);
};
