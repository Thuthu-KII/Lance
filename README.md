[![Coverage Status](https://coveralls.io/repos/github/Thuthu-KII/Lance/badge.png?branch=lance)](https://coveralls.io/github/Thuthu-KII/Lance?branch=lance)
# Freelancer Management Platform (Lance)

A comprehensive web application connecting clients with freelancers, enabling job posting, application, management, and payments with admin oversight.

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Database Structure](#database-structure)
- [Security Features](#security-features)
- [Usage & Demo](#usage--demo)
- [Project Artifacts](#project-artifacts)
- [License](#license)

## Features

### Clients
- Register and create profile
- Post jobs with budget and details
- View and manage freelancer applications
- Hire freelancers and mark jobs complete
- Generate invoices

### Freelancers
- Register, upload documents (CV, certificates)
- Browse and apply for jobs
- Manage assigned jobs and mark complete
- Track earnings

### Admins
- Approve freelancer registrations
- Manage users and monitor jobs/applications
- Handle reported issues
- Process payments to freelancers
- View system statistics/dashboard

## Technology Stack
- **Backend:** Node.js with Express.js
- **Database:** PostgreSQL
- **Authentication:** Passport.js (Local & Google OAuth)
- **File Upload:** Multer
- **Payment:** Yoco API
- **Frontend:** EJS templates with CSS
- **Security:** Helmet, bcrypt, express-session

## Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/Thuthu-KII/Lance.git
   cd Lance


2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` from `.env.example` and configure environment variables.

4. Setup PostgreSQL and update `DATABASE_URL` in `.env`.

5. Start server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. Access the app at: [http://localhost:3000](http://localhost:3000)

## Database Structure

- `users` — user authentication and core info
- `clients` — client profiles
- `freelancers` — freelancer profiles, including approval status
- `admins` — admin profiles
- `jobs` — job listings with statuses and payment data
- `job_applications` — freelancer applications to jobs
- `payments` — records of payments made
- `reports` — user issue reports
- `job_completions` — tracking job completion status

## Security Features

- Password hashing with bcrypt
- Session management via express-session
- HTTP header protection with Helmet
- CSRF protection
- Input validation with express-validator
- Role-based access control (clients, freelancers, admins)

## Usage & Demo

- [Screen Recording Demo Video](SCREEN_RECORDING_VIDEO_LINK)
- [Publicly Hosted Application](DEPLOYED_APP_LINK)
- **Access Instructions:**
  - Credentials or any special instructions to login/use the app: `<INSTRUCTIONS OR TEST ACCOUNTS HERE>`

## Project Artifacts

- [GitHub Repository](https://github.com/Thuthu-KII/Lance) (public, with full code and commit history)
- **Scrum Artifacts:**
  - [Product Backlog](/Docs/scrum/product_backlog.md)
  - [Sprint Backlogs](/Docs/scrum/product_backlog.md)
  - [Sprint Burndown Charts](/Docs/scrum/burndown_charts.md)
  - [Sprint Retrospective Reports](/Docs/scrum/sprint_retros.md)
  - [Daily Stand-Up Summaries](/Docs/scrum/sprint_retros.md)
  - [Sprint Review Demonstrations](/Docs/scrum/sprint_reviews.md)
- **Additional Design Documents:**
  - [Project Plan](/Docs/Planning%and%Design/framework.md)
  - [Architecture Diagram](/Docs/Planning%and%Design/architecthure.md)
  - [Test Plan and Results](/Docs/testing)
## License

This project is licensed under the MIT License.

---

*This README serves as the main navigation document for the Freelancer Management Platform project submission. Replace placeholders with actual links before final submission.*
```

---
