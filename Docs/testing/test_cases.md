# Test Cases

## Authentication Tests

| Test Case ID | Description                         | Precondition             | Steps                          | Expected Result                | Status |
|--------------|-----------------------------------|-------------------------|--------------------------------|-------------------------------|--------|
| AUTH-001     |                                   |                         |                                |                               |        |
| AUTH-002     |                                   |                         |                                |                               |        |

---

## Admin Tests

| Test Case ID | Description                      | Precondition        | Steps                         | Expected Result                  | Status |
|--------------|---------------------------------|--------------------|-------------------------------|---------------------------------|--------|
| ADMIN-001    | Find admin by user ID            | Admin exists       | Call `findByUserId(userId)`    | Returns correct admin record     |        |
| ADMIN-002    | Find admin by ID                 | Admin exists       | Call `findById(id)`            | Returns correct admin record     |        |
| ADMIN-003    | Create new admin                 | Valid admin data   | Call `create(data)`            | Inserts and returns new admin    |        |
| ADMIN-004    | Update existing admin            | Admin exists       | Call `update(id, data)`        | Updates and returns updated admin|        |
| ADMIN-005    | Get all admins with user emails | Admins exist       | Call `getAll()`                | Returns list of all admins       |        |
| ADMIN-006    | Count total admins              | Admins exist       | Call `count()`                 | Returns total count of admins    |        |
                                 |                         |                                |                               |        |

---

## Client Model Tests

| Test Case ID | Description                      | Precondition        | Steps                         | Expected Result                  |
|--------------|---------------------------------|--------------------|-------------------------------|---------------------------------|
| CLIENT-001   | Find client by user ID           | Client exists       | Call `findByUserId(userId)`    | Returns client object            |
| CLIENT-002   | Find client by user ID (not found)| No client          | Call `findByUserId(userId)`    | Returns null                    |
| CLIENT-003   | Find client by ID                | Client exists       | Call `findById(id)`            | Returns client object            |
| CLIENT-004   | Find client by ID (not found)   | No client           | Call `findById(id)`            | Returns null                    |
| CLIENT-005   | Create new client                | Valid data          | Call `create(data)`            | Returns newly created client    |
| CLIENT-006   | Update existing client           | Client exists       | Call `update(id, data)`        | Returns updated client          |
| CLIENT-007   | Update with no data              | Client exists       | Call `update(id, {})`          | Returns existing client         |
| CLIENT-008   | Get client with user details     | Client exists       | Call `getWithUserDetails(id)`  | Returns client with user details|
| CLIENT-009   | Get client with user details (none)| No client          | Call `getWithUserDetails(id)`  | Returns null                   |
| CLIENT-010   | Get all clients with user details| Clients exist       | Call `getAll()`                | Returns list of clients         |
| CLIENT-011   | Count total clients              | Clients exist       | Call `count()`                 | Returns count                   |
| CLIENT-012   | Get jobs for client              | Jobs exist          | Call `getJobs(clientId)`       | Returns jobs list               |

---

## User Tests (Freelancer & General User)

| Test Case ID | Description                                      | Precondition             | Steps                          | Expected Result                    | Status |
|--------------|------------------------------------------------|-------------------------|--------------------------------|-----------------------------------|--------|
| USER-001     | Find freelancer by user ID                       | Freelancer exists       | Call `findByUserId(userId)`     | Returns correct freelancer record |        |
| USER-002     | Create new freelancer                            | Valid freelancer data   | Call `create(data)`             | Inserts and returns new freelancer|        |
| USER-003     | Update existing freelancer                       | Freelancer exists       | Call `update(id, data)`         | Updates and returns updated data  |        |
| USER-004     | Approve freelancer                               | Freelancer pending      | Call `approve(id)`              | Freelancer marked approved         |        |
| USER-005     | Retrieve freelancer with user details           | Freelancer exists       | Call `getWithUserDetails(id)`   | Returns combined freelancer/user info |    |
| USER-006     | Get all freelancers, filtered by approval       | Freelancers exist       | Call `getAll({ approved: true })`| Returns list of approved freelancers|    |
| USER-007     | Get pending freelancer approvals                 | Pending freelancers     | Call `getPendingApprovals()`    | Returns list of unapproved freelancers|    |
| USER-008     | Count freelancers (total and approved)           | Freelancers exist       | Call `count(approved?)`         | Returns correct count              |        |
| USER-009     | Get job applications for a freelancer            | Freelancer has apps     | Call `getApplications(freelancerId)` | Returns list of job applications |    |
| USER-010     | Get hired jobs for a freelancer                   | Freelancer hired jobs   | Call `getHiredJobs(freelancerId)` | Returns list of hired jobs         |        |

---
