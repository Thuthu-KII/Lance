[![codecov](https://codecov.io/gh/dreadnought147/Lance/branch/backend-api/graph/badge.svg)](https://codecov.io/gh/dreadnought147/Lance)

# Lance
Codebase for the freelancer app, Lance.

## Table of Contents
- [Overview](#overview)
- [Backend Auth](#backend-auth)
- [Backend Client](#backend-client)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)

## Overview
Lance is a freelancer platform enabling clients to post jobs and freelancers to apply. This repository `so far` contains the backend and API logic for the platform.

---

## Backend Auth

Handles authentication logic including Google OAuth, role validation, and secure redirects.

### Implemented Features:
- **Google OAuth with Role Identification**  
  Uses the OAuth `state` parameter to pass the user role (Client or Freelancer) during authentication.
- **Passport Strategy and Serialization**
  - Populates a custom user object in the OAuth callback.
  - `serializeUser` stores only `googleId` and `role`.
  - `deserializeUser` fetches user from the database using `googleId` and `role`, attaching it to `req.user` it returns  [the_user,user,role] array of objs, the_user has the profile info such as name, email etc

---

## Backend Client

Covers client-specific backend functionality: job posting, job application handling, and client dashboard operations.

### Implemented Features:
- **Dashboard Rendering**
  - Modified `client.ejs`, `homepage.ejs`, and `login.ejs` to correctly render user data from routes.
- **Client Job Posting (Stub-based)**
  - Routes created to handle job posting via form submission.
  - Uses temporary SQLite stubs locally

---
### Backend Freelance
george will populate

## Installation

```bash
git clone https://github.com/dreadnought147/Lance.git
cd Lance
npm install

### Run
 npm run dev

## Testing
still havent gotten codecov up and running properly but Sacha will update



