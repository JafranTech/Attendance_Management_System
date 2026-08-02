# Security Testing Strategy

## Overview
Security testing ensures that the Attendance Management System protects sensitive user data and enforces strict access controls based on user roles (Admin, Faculty, Student).

## Areas of Focus

1.  **Authentication & Authorization:**
    *   Verify that JWT tokens are securely stored and transmitted.
    *   Ensure session timeouts and logout functionality completely invalidate the session.
    *   Test for privilege escalation (e.g., a Student attempting to access an Admin API endpoint or URL route).

2.  **Row Level Security (RLS) in Supabase:**
    *   **Crucial:** RLS policies must be rigorously tested.
    *   *Test:* Can a student read another student's grades or attendance history? (Should be Denied).
    *   *Test:* Can faculty modify attendance for a course they do not teach? (Should be Denied).
    *   *Test:* Can anyone other than an Admin create or delete users? (Should be Denied).

3.  **Input Validation & Sanitization:**
    *   Test form inputs for SQL Injection and Cross-Site Scripting (XSS) vulnerabilities.
    *   Ensure that attendance codes are validated (e.g., correct length, not expired).

4.  **API Security:**
    *   Ensure all Supabase API requests contain a valid Authorization header.
    *   Rate limiting tests (e.g., preventing brute-force attacks on the login page or attendance submission endpoint).

## Action Plan
*   Regularly review Supabase RLS policies.
*   Use automated vulnerability scanners (e.g., npm audit, Snyk) for third-party dependencies.
*   Conduct a manual security review of access controls before any major production release.
