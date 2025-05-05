[![Coverage Status](https://coveralls.io/repos/github/Thuthu-KII/Lance/badge.svg?branch=backend-api)](https://coveralls.io/github/Thuthu-KII/Lance?branch=backend-api)

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

### Implemented Features(so far):
- **Google OAuth with Role Identification**  
  Uses the OAuth `state` parameter to pass the user role (Client or Freelancer) during authentication.
- **Passport Strategy and Serialization**
  - Populates a custom user object in the OAuth callback.
  - `serializeUser` stores only `googleId` and `role`.
  - `deserializeUser` fetches user from the database using `googleId` and `role`, attaching it to `req.user` it returns  [the_user,user,role] array of objs, the_user has the profile info such as name, email etc

---

## Backend Client

Covers client-specific backend functionality: job posting, job application handling, and client dashboard operations.

### Implemented Features(so far):
- **Dashboard Rendering**
  - Modified `client.ejs`, `homepage.ejs`, and `login.ejs` to correctly render user data from routes.
- **Client Job Posting (Stub-based)**
  - Routes created to handle job posting via form submission.
  - Uses temporary SQLite stubs locally


### Client Dashboard
-  Added signout functionality  **added it to freelancer dash by mistake, george please note my apologies** 
- **Security Concern**: Back arrow still allows navigation back (needs fix)  
- Updated `href` for signout to point to `/logout` endpoint  

### Job Postings
-  Can post jobs (see [`jobsModel.js`](./jobsModel.js) for stored fields)  
- **Note**: Still **not connected to a database**  

---

## TO-DO
- [ ] Fix back-button security issue after logout  
- [ ] Update Client-side functions (profile, etc.)  
- [ ] Connect job postings to database  

---

## Key Files Modified
| File | Changes |  
|------|---------|  
| Freelancer Dashboard | Signout routing + security fixes(still need fixing) |  

---
## Security Notes
- Cache-control headers are set in `/logout` route  but isnt working **note**
- Sessions are destroyed on logout  
- Session cookie (`connect.sid`) is cleared  

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



