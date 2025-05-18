/**
 * Email Service
 * Note: This uses a simplified approach for email sending
 * In production, you would integrate with a proper email service like SendGrid, Mailgun, etc.
 */
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create test account for development if no SMTP settings provided
let transporter;

const initTransporter = async () => {
  // If there are no SMTP settings, create a test account
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    // Create reusable transporter object using ethereal.email test account
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('Using test email account:', testAccount.user);
  } else {
    // Create transporter with provided SMTP settings
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
};

// Initialize transporter when server starts
initTransporter().catch(console.error);

// Common email sending function
const sendEmail = async (options) => {
  try {
    // Make sure transporter is initialized
    if (!transporter) {
      await initTransporter();
    }
    
    // Email options
    const mailOptions = {
      from: `"lance" <${process.env.EMAIL_FROM || 'noreply@lance.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // Log URL for test accounts
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Welcome email for new users
exports.sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to lance!';
  const message = `
    Hi ${user.firstName},
    
    Welcome to lance! We're excited to have you on board.
    
    ${user.role === 'freelancer' 
      ? 'Your account is currently under review. We\'ll notify you once it\'s approved.' 
      : 'You can now start using our platform to post jobs and find talented freelancers.'}
    
    If you have any questions, feel free to contact our support team.
    
    Best regards,
    The lance Team
  `;
  
  // HTML version of the email
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #3498db; padding: 20px; text-align: center; color: white;">
        <h1>Welcome to lance!</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee;">
        <p>Hi ${user.firstName},</p>
        <p>Welcome to lance! We're excited to have you on board.</p>
        <p>${user.role === 'freelancer' 
            ? 'Your account is currently under review. We\'ll notify you once it\'s approved.' 
            : 'You can now start using our platform to post jobs and find talented freelancers.'}</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The lance Team</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} lance. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: user.email,
    subject,
    message,
    html
  });
};

// Freelancer approval notification
exports.sendFreelancerApprovalEmail = async (user) => {
  const subject = 'Your lance Account has been Approved!';
  const message = `
    Hi ${user.firstName},
    
    Great news! Your lance account has been approved.
    
    You can now log in to your account and start applying for jobs.
    
    Best regards,
    The lance Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #3498db; padding: 20px; text-align: center; color: white;">
        <h1>Account Approved!</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee;">
        <p>Hi ${user.firstName},</p>
        <p>Great news! Your lance account has been approved.</p>
        <p>You can now <a href="${process.env.APP_URL || 'http://localhost:3000'}/auth/login" style="color: #3498db;">log in to your account</a> and start applying for jobs.</p>
        <p>Best regards,<br>The lance Team</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} lance. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: user.email,
    subject,
    message,
    html
  });
};

// Job application notification to client
exports.sendJobApplicationNotificationToClient = async (application, job, client, freelancer) => {
  const subject = `New Application for ${job.title}`;
  const message = `
    Hi ${client.firstName},
    
    You have received a new application for your job "${job.title}".
    
    Freelancer: ${freelancer.firstName} ${freelancer.lastName}
    
    Log in to view the application and the freelancer's details.
    
    Best regards,
    The lance Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #3498db; padding: 20px; text-align: center; color: white;">
        <h1>New Job Application</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee;">
        <p>Hi ${client.firstName},</p>
        <p>You have received a new application for your job "<strong>${job.title}</strong>".</p>
        <p><strong>Freelancer:</strong> ${freelancer.firstName} ${freelancer.lastName}</p>
        <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/client/jobs/${job.id}/applications" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Application</a></p>
        <p>Best regards,<br>The lance Team</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} lance. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: client.email,
    subject,
    message,
    html
  });
};

// Hiring notification to freelancer
exports.sendHiringNotificationToFreelancer = async (job, freelancer, client) => {
  const subject = `Congratulations! You've been hired for "${job.title}"`;
  const message = `
    Hi ${freelancer.firstName},
    
    Congratulations! You have been hired for the job "${job.title}" by ${client.firstName} ${client.lastName}.
    
    Please log in to view the job details and get started.
    
    Best regards,
    The lance Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2ecc71; padding: 20px; text-align: center; color: white;">
        <h1>You've Been Hired!</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee;">
        <p>Hi ${freelancer.firstName},</p>
        <p>Congratulations! You have been hired for the job "<strong>${job.title}</strong>" by ${client.firstName} ${client.lastName}.</p>
        <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/freelancer/jobs/${job.id}" style="display: inline-block; background-color: #2ecc71; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Job Details</a></p>
        <p>Best regards,<br>The lance Team</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} lance. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: freelancer.email,
    subject,
    message,
    html
  });
};

// Job completion notification
exports.sendJobCompletionNotification = async (job, recipient, recipientRole) => {
  const isClient = recipientRole === 'client';
  
  const subject = `Job "${job.title}" has been completed`;
  const message = `
    Hi ${recipient.firstName},
    
    The job "${job.title}" has been marked as complete by ${isClient ? 'the freelancer' : 'the client'}.
    
    Please log in to confirm completion and ${isClient ? 'finalize payment.' : 'receive your payment.'}
    
    Best regards,
    The lance Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #3498db; padding: 20px; text-align: center; color: white;">
        <h1>Job Completion Notice</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee;">
        <p>Hi ${recipient.firstName},</p>
        <p>The job "<strong>${job.title}</strong>" has been marked as complete by ${isClient ? 'the freelancer' : 'the client'}.</p>
        <p>Please log in to confirm completion and ${isClient ? 'finalize payment.' : 'receive your payment.'}</p>
        <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/${recipientRole}/jobs/${job.id}" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Job</a></p>
        <p>Best regards,<br>The lance Team</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} lance. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: recipient.email,
    subject,
    message,
    html
  });
};

// Payment notification to freelancer
exports.sendPaymentNotificationToFreelancer = async (payment, job, freelancer) => {
  const subject = `Payment Received for Job "${job.title}"`;
  const message = `
    Hi ${freelancer.firstName},
    
    Good news! You have received a payment of $${parseFloat(payment.amount).toFixed(2)} for the job "${job.title}".
    
    Thank you for your work on the lance platform.
    
    Best regards,
    The lance Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2ecc71; padding: 20px; text-align: center; color: white;">
        <h1>Payment Received</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee;">
        <p>Hi ${freelancer.firstName},</p>
        <p>Good news! You have received a payment of <strong>$${parseFloat(payment.amount).toFixed(2)}</strong> for the job "${job.title}".</p>
        <p>Thank you for your work on the lance platform.</p>
        <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/freelancer/dashboard" style="display: inline-block; background-color: #2ecc71; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Dashboard</a></p>
        <p>Best regards,<br>The lance Team</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} lance. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: freelancer.email,
    subject,
    message,
    html
  });
};

// Report notification to admin
exports.sendReportNotificationToAdmin = async (report, adminEmail) => {
  const subject = `New Issue Report on lance`;
  const message = `
    Hello Admin,
    
    A new issue has been reported on the lance platform.
    
    Report ID: ${report.id}
    Reported by: ${report.reporter_email || 'Anonymous'}
    Issue: ${report.issue.substring(0, 100)}${report.issue.length > 100 ? '...' : ''}
    
    Please log in to the admin panel to review this report.
    
    Regards,
    lance System
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #e74c3c; padding: 20px; text-align: center; color: white;">
        <h1>New Issue Report</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee;">
        <p>Hello Admin,</p>
        <p>A new issue has been reported on the lance platform.</p>
        <div style="background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-left: 4px solid #e74c3c;">
          <p><strong>Report ID:</strong> ${report.id}</p>
          <p><strong>Reported by:</strong> ${report.reporter_email || 'Anonymous'}</p>
          <p><strong>Issue:</strong> ${report.issue.substring(0, 100)}${report.issue.length > 100 ? '...' : ''}</p>
        </div>
        <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/reports/${report.id}" style="display: inline-block; background-color: #e74c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Review Report</a></p>
        <p>Regards,<br>lance System</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} lance. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email: adminEmail,
    subject,
    message,
    html
  });
};

module.exports = {
  sendEmail,
  ...exports
};