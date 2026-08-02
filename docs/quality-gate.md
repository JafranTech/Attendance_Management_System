# Quality Gate Criteria

## Overview
A Quality Gate is a set of strict conditions that the codebase must meet before it can be merged into the main branch or deployed to production. This ensures that major changes do not degrade the stability or maintainability of the Attendance Management System.

## Pre-Merge Quality Gate (Pull Requests)
Before any code is merged, it must pass the following automated checks:

1.  **Code Compilation:** The React application builds successfully without errors (`npm run build`).
2.  **Linting & Formatting:** Code passes ESLint and Prettier checks with no warnings or errors.
3.  **Unit & Integration Tests:** 100% of existing tests must pass.
4.  **Code Coverage:** New code must maintain or increase the overall test coverage (Target: >75%).
5.  **Security Scans:** No critical or high-severity vulnerabilities found in dependencies (`npm audit`).

## Pre-Deployment Quality Gate (Staging/Production)
Before deploying a major release, the following manual and automated checks must be cleared:

1.  **E2E Tests Passed:** All critical user flows (Login, Mark Attendance, View Reports) pass in the staging environment.
2.  **Database Migrations:** SQL migrations have been reviewed and successfully tested on a staging database.
3.  **Performance Check:** If major backend changes were made, verify that query performance hasn't degraded.
4.  **Peer Review:** At least one other developer has reviewed and approved the architectural and code changes.

## Enforcement
These gates should ideally be enforced via CI/CD pipelines (e.g., GitHub Actions). If a gate fails, the deployment is blocked until the underlying issue is resolved.
