# Test Plan

## Overview

This project uses **Jest** as the primary testing framework to ensure backend functionality and routing work as expected. Testing focuses on critical components such as user authentication, job posting workflows, profile updates, and admin operations. Automated tests help maintain code quality and catch regressions early.

## Coverage and Tools

- Initial attempts were made to integrate **Codecov** for coverage reporting, but due to configuration issues, the team switched to **Coveralls**, which is now successfully tracking test coverage.
- Test coverage includes unit tests and integration tests across controllers, models, and routes.

## Test Scope

- **Authentication:** Tests for login, signup, OAuth integration, and access control by user roles (client, freelancer, admin).
- **Job Management:** Verifying job creation, status updates, application tracking, and deletion.
- **Profile Management:** Ensuring updates to client and freelancer profiles are correctly processed and validated.
- **Admin Features:** Testing user management, job oversight, and approval flows like police clearance certificates.
- **Routing:** Validating API endpoints respond correctly with proper status codes and payloads.

## Testing Strategy

- Tests are written to be modular and isolated for easy maintenance.
- Continuous Integration (CI) pipelines run tests on each push to maintain code reliability.
- Future plans include increasing test coverage on edge cases and error handling scenarios.

---

