# Unit Testing Strategy

## Overview
Unit testing involves testing individual components and functions of the Attendance Management System in isolation to ensure they work as expected. 

## Tools
*   **Framework:** Jest
*   **React Components:** React Testing Library

## What to Test
1.  **UI Components:**
    *   Render tests (ensure components render without crashing).
    *   State changes (e.g., toggling a modal, updating a form input).
    *   Prop passing (ensure components behave correctly based on props).
    *   *Examples:* `Button`, `InputField`, `DataTable`, `Sidebar`.

2.  **Utility Functions:**
    *   Date and time formatting helpers.
    *   Data transformation logic.
    *   Calculation functions (e.g., calculating attendance percentage).

3.  **Hooks:**
    *   Custom hooks for fetching data or managing local state.

## Best Practices
*   **Isolation:** Mock external dependencies like Supabase API calls or local storage.
*   **Naming Convention:** Name test files as `[ComponentName].test.jsx` or `[functionName].test.js`.
*   **Coverage:** Aim for at least 80% code coverage on core utilities and critical UI components.
*   **Behavior-Driven:** Test what the component *does* from a user's perspective, not its internal implementation details.

## Running Tests
Run the unit test suite locally before pushing code:
```bash
npm run test
```
