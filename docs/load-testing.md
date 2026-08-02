# Load & Performance Testing

## Overview
Load testing is critical for the Attendance Management System because usage is highly concentrated. For example, a class of 100 students might all attempt to mark their attendance within the exact same 2-minute window.

## Tools
*   **Frameworks:** k6, JMeter, or Artillery

## Scenarios to Test
1.  **The "Class Start" Spike:**
    *   Simulate 100-500 concurrent users logging in and submitting an attendance code simultaneously.
    *   *Metric to watch:* API response time, database connection pooling, and error rates.

2.  **Dashboard Load:**
    *   Simulate Faculty or Admin loading a dashboard that calculates attendance statistics for a large number of students over a semester.
    *   *Metric to watch:* Query execution time and UI rendering performance.

3.  **Real-time Subscriptions (if applicable):**
    *   If using Supabase real-time features to show faculty who has marked attendance, test the socket connection stability under load.

## Supabase Considerations
*   Monitor database CPU and RAM usage during load tests.
*   Check Postgres connection limits. Ensure connection pooling (PgBouncer) is configured if concurrent connections exceed the tier limit.
*   Optimize slow queries using indexing (e.g., indexing `course_id` and `student_id` on the `attendance` table).

## Acceptable Thresholds
*   95% of API requests should complete in under 500ms.
*   0% error rate (HTTP 500s) during the expected peak load (e.g., 200 concurrent attendance submissions).
