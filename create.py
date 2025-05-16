import os
from pathlib import Path

# List of directories to create
directories = [
    'backend/config',
    'backend/controllers',
    'backend/models',
    'backend/routes',
    'backend/views',
    'public/css',
    'public/uploads/cvs',
    'public/uploads/clearances'
]

# List of files to create, mapped to their directory paths
files = [
    '.env.example',
    'README.md',
    'package.json',
    'backend/app.js',
    'backend/config/passport.js',
    'backend/controllers/adminController.js',
    'backend/controllers/applicationController.js',
    'backend/controllers/authController.js',
    'backend/controllers/invoiceController.js',
    'backend/controllers/jobController.js',
    'backend/controllers/userController.js',
    'backend/models/adminModel.js',
    'backend/models/applicationModel.js',
    'backend/models/index.js',
    'backend/models/jobModel.js',
    'backend/models/userModel.js',
    'backend/routes/adminRoutes.js',
    'backend/routes/applicationRoutes.js',
    'backend/routes/authRoutes.js',
    'backend/routes/invoiceRoutes.js',
    'backend/routes/jobRoutes.js',
    'backend/routes/pageRoutes.js',
    'backend/routes/userRoutes.js',
    'backend/views/adminDashboard.ejs',
    'backend/views/applications.ejs',
    'backend/views/clientDashboard.ejs',
    'backend/views/homepage.ejs',
    'backend/views/invoice.ejs',
    'backend/views/jobsList.ejs',
    'backend/views/layout.ejs',
    'backend/views/login.ejs',
    'backend/views/signup.ejs',
    'public/css/styles.css'
]

# Create directories if they don't exist
for directory in directories:
    Path(directory).mkdir(parents=True, exist_ok=True)

# Create files, making sure directories exist
for file in files:
    Path(file).touch()

print("Directories and files created successfully.")