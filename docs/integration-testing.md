# Integration Testing Strategy

## Overview
Integration testing ensures that different parts of the Attendance Management System work together correctly. This involves testing the interaction between UI components, custom hooks, and the backend services (Supabase).

## Tools
*   **Framework:** Jest & React Testing Library (with mocked API calls)
*   **Mocking:** MSW (Mock Service Worker) or Jest mocks for Supabase client.

## What to Test
1.  **Component Interactions:**
    *   Data flow between parent and child components.
    *   Form submissions triggering API service calls.

2.  **Service Layers:**
    *   Verifying that `studentsService`, `facultyService`, and `adminService` correctly format requests to Supabase and handle responses/errors.
    
3.  **Authentication Flow:**
    *   Login process: Submitting credentials -> calling Supabase Auth -> storing session -> redirecting to the correct dashboard based on user role.

4.  **Core Workflows:**
    *   **Faculty:** Creating a class session and generating an attendance code.
    *   **Student:** Submitting an attendance code and updating the status.
    *   **Admin:** Adding a new user and assigning a role.

## Best Practices
*   **Database Mocking:** Do not run integration tests against the production database. Use a local Supabase instance or mock the API responses.
*   **State Management:** Ensure that global state (Context/Redux) updates correctly after a sequence of actions.

## Execution
Run integration tests as part of the pre-commit hook or CI pipeline to catch breaking changes early.
