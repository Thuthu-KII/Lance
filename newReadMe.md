# Running the Freelancer Management Platform: Detailed Breakdown

## Prerequisites

Before you can run the application, you need to have the following installed:

1. **Node.js and npm**: Version 14.0.0 or higher
   - Download from: https://nodejs.org/

2. **PostgreSQL**: Version 12 or higher
   - Download from: https://www.postgresql.org/download/
   - You'll need to create a database for the application

3. **Git** (optional, but recommended for easy cloning)
   - Download from: https://git-scm.com/downloads

## Step 1: Set Up Database

1. Install PostgreSQL if you haven't already
2. Create a new database:
   ```sql
   CREATE DATABASE freelancer_platform;
   ```
3. Note your PostgreSQL credentials (username, password, host, port)

## Step 2: Get the Code

Either clone the repository using Git:
```bash
git clone [repository URL]
cd freelancer-platform
```

Or download and extract the code manually.

## Step 3: Install Dependencies

Navigate to the project directory in your terminal or command prompt, and run:
```bash
npm install
```

This will install all required packages specified in the package.json file.

## Step 4: Environment Configuration

1. Create a `.env` file in the project root directory
2. Use the `.env.example` file as a template
3. Add your specific configuration:

```
# Application
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_strong_random_secret_key

# Database
DATABASE_URL=postgres://yourusername:yourpassword@localhost:5432/freelancer_platform

# Google OAuth (optional, only needed if you want Google login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Payment (YOCO)
YOCO_PUBLIC_KEY=your_yoco_public_key
YOCO_SECRET_KEY=your_yoco_secret_key

# Admin credentials (for default admin)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Email (optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_SECURE=false
EMAIL_FROM=noreply@lance.com
```

Notes:
- For development, you can leave the Google OAuth and YOCO payment settings as placeholders - the app will use mock implementations
- The SESSION_SECRET should be a long, random string for security
- EMAIL settings are optional - without them, emails will be logged to the console in development mode

## Step 5: Initialize the Database

You have two options to set up the database schema:

### Option 1: Using the schema.sql file

1. Connect to your PostgreSQL instance
2. Execute the schema.sql file:
   ```bash
   psql -U yourusername -d freelancer_platform -f schema.sql
   ```

### Option 2: Let the application initialize the database

The application is designed to initialize the database tables on first run through the database.js config file.

## Step 6: Create Default Users (Optional)

For testing purposes, you can create default users by running:
```bash
node scripts/create-default-users.js
```

This will create:
- Admin user: admin@example.com / admin123
- Client user: client@example.com / client123
- Freelancer user: freelancer@example.com / freelancer123 (pre-approved)

## Step 7: Start the Application

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start running on http://localhost:3000 (or the PORT specified in your .env file).

## Step 8: Accessing the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Directory Structure Overview

For reference, here's the key directories you should see:

- `config/` - Configuration files for database, authentication, and payment
- `controllers/` - Business logic for different features
- `middleware/` - Request interceptors for authentication, file upload, etc.
- `models/` - Database models representing tables
- `public/` - Static assets (CSS, JavaScript, uploads)
- `routes/` - URL routing
- `services/` - Service modules for email, payments, etc.
- `utils/` - Utility functions
- `views/` - EJS templates for rendering HTML
- `scripts/` - Helper scripts

## Creating Upload Directories

Make sure the upload directories exist:
```bash
mkdir -p public/uploads/cvs
mkdir -p public/uploads/clearances
```

This ensures file uploads work properly.

## Common Issues and Solutions

1. **Database Connection Issues**:
   - Check your PostgreSQL connection string in the .env file
   - Ensure PostgreSQL is running
   - Verify you have the correct permissions

2. **File Upload Errors**:
   - Make sure the upload directories exist and are writable
   - Check file size limits in fileUpload.js middleware

3. **Google OAuth Issues**:
   - If using Google login, make sure your API credentials are set up correctly in the Google Cloud Console
   - Ensure the callback URL matches exactly what's in your Google OAuth settings

4. **CSS Not Loading**:
   - If styles aren't appearing, check your CSP settings in app.js
   - Ensure the public directory is properly configured

## Testing Payment Integration

The application includes a simulated Yoco payment gateway for development:

1. In development mode, payments will be automatically simulated without real transactions
2. To test the full payment flow, register as a client, post a job, and proceed to payment
3. Use the following test card details in development:
   - Card number: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: Any 3 digits

## Testing User Workflows

### Client Workflow:
1. Register as a client
2. Create a job
3. Pay for job posting
4. View applications from freelancers
5. Hire a freelancer
6. Mark job as complete
7. Generate invoice

### Freelancer Workflow:
1. Register as a freelancer
2. Wait for admin approval
3. Browse available jobs
4. Apply for jobs
5. Work on hired jobs
6. Mark jobs as complete
7. Get paid

### Admin Workflow:
1. Login as admin
2. Approve freelancer registrations
3. Manage users
4. Process payments to freelancers
5. Handle reports and issues
6. View system statistics

## Advanced Configuration (Optional)

### Setting up Email Notifications

For real email notifications:
1. Add proper SMTP settings in your .env file
2. Emails will be sent for important events like registrations, approvals, etc.

### Integrating Real Payment Gateway

For real Yoco payments:
1. Sign up for a Yoco account at https://www.yoco.com/
2. Get your API keys from the Yoco dashboard
3. Update YOCO_PUBLIC_KEY and YOCO_SECRET_KEY in your .env file
4. Set NODE_ENV=production to use the real payment gateway

## Deployment Considerations

When deploying to production:

1. Set NODE_ENV=production in .env
2. Use a strong SESSION_SECRET
3. Set up proper PostgreSQL credentials with limited permissions
4. Configure secure HTTPS with a valid SSL certificate
5. Set up proper error logging
6. Consider using a process manager like PM2 for reliability
7. Implement regular database backups

## Getting Help

If you encounter issues:
1. Check the application logs for detailed error messages
2. Review the relevant code files mentioned in error stack traces
3. Consult the documentation for dependencies (Express, Passport, Multer, etc.)

By following these steps, you should have a fully functional Freelancer Management Platform running on your system.