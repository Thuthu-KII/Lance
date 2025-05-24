https://coveralls.io/repos/github/Thuthu-KII/Lance/badge.svg?branch=lance(Coverage Status)!:https://coveralls.io/github/Thuthu-KII/Lance?branch=lance
# Freelancer Management Platform

A comprehensive web application for connecting clients with freelancers. This platform allows clients to post jobs, freelancers to apply, and administrators to manage the entire system.

## Features

### For Clients
- Register and create a profile
- Post jobs with details and budget
- View applications from freelancers
- Hire freelancers for jobs
- Mark jobs as complete
- Generate invoices

### For Freelancers
- Register and upload required documents
- Browse available jobs
- Apply to jobs with motivation statements
- Work on assigned jobs
- Mark jobs as complete
- Track earnings

### For Admins
- Approve freelancer registrations
- Manage users (clients, freelancers, admins)
- Monitor jobs and applications
- Handle reported issues
- Process payments to freelancers
- View system statistics

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: Passport.js with local strategy and Google OAuth
- **File Upload**: Multer
- **Payment Processing**: Yoco API
- **Frontend**: EJS templates with CSS
- **Security**: Helmet, bcrypt

## Installation

1. Clone the repository:
git clone https://github.com/yourusername/freelancer-platform.git
cd freelancer-platform


2. Install dependencies:
npm install

3. Create a `.env` file based on `.env.example` and fill in your configuration details.

4. Set up your PostgreSQL database and update the DATABASE_URL in your `.env` file.

5. Start the application:
npm start



For development with auto-reload:
npm run dev


Collapse

6. Access the application at: http://localhost:3000

## Database Structure

The application uses several related tables:
- users - Core user information and authentication
- clients - Client-specific profile data
- freelancers - Freelancer-specific profile data with approval status
- admins - Admin-specific profile data
- jobs - Job listings with status and payment info
- job_applications - Applications from freelancers to jobs
- payments - Payment records for job postings and freelancer payments
- reports - Issue reports from users
- job_completions - Completion status tracking

## Security Features

- Password hashing with bcrypt
- Session management with express-session
- HTTP headers security with helmet
- CSRF protection
- Input validation
- Role-based access control

## License

This project is licensed under the MIT License.
Summary
This completes the implementation of the Freelancer Management Platform. The application includes:

User Management System with three roles: Client, Freelancer, and Admin
Authentication with both local email/password and Google OAuth
Job Management for posting, browsing, and applying to jobs
Application and Hiring Process for connecting clients with freelancers
Payment Integration with Yoco for job posting and freelancer payments
Document Management for uploading and viewing CVs and clearance certificates
Approval System for admin verification of freelancers
Reporting System for handling issues
Invoice Generation in CSV format
Dashboard with relevant information for each user ro
