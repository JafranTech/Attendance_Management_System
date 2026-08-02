# End-to-End (E2E) Testing Strategy

## Overview
E2E testing simulates real user scenarios from start to finish. It verifies that the entire application stack (Frontend + Backend Database) is functioning correctly in a real browser environment.

## Tools
*   **Framework:** Cypress or Playwright

## Key User Flows to Test
1.  **Authentication & Role Routing:**
    *   Login as an Admin -> Verify Admin Dashboard loads.
    *   Login as Faculty -> Verify Faculty Dashboard loads.
    *   Login as Student -> Verify Student Dashboard loads.
    *   Attempt login with invalid credentials -> Verify error message.

2.  **The Attendance Lifecycle:**
    *   **Step 1 (Faculty):** Login, select a course, start a session, and display the attendance code.
    *   **Step 2 (Student):** Login, navigate to the ongoing session, enter the code, and submit.
    *   **Step 3 (Faculty):** Verify the student's status updates to 'Present' in real-time or upon refresh.

3.  **Data Management:**
    *   Admin adds a new student via the UI -> Student appears in the users list.
    *   Faculty creates a new course -> Course appears in the faculty's assigned courses.

## Best Practices
*   **Dedicated Test Environment:** Run E2E tests against a dedicated staging environment or a localized Supabase setup to prevent dirtying production data.
*   **Test Data Setup/Teardown:** Scripts should automatically seed the database with necessary test users/courses before running and clean up afterward.
*   **Resilience:** Use data-test-id attributes (`data-testid="login-button"`) for selecting elements rather than relying on CSS classes or text that might change.
