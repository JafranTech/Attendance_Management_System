# Deployment Checklist

## Overview
This checklist should be followed meticulously before, during, and after deploying a major update to the Attendance Management System production environment.

## Phase 1: Pre-Deployment (Staging/Local)
- [ ] All Quality Gates passed (tests, linting, build).
- [ ] Database migrations tested locally or on staging.
- [ ] Environment variables (`.env`) for production are verified and updated if new keys were added.
- [ ] Supabase Row Level Security (RLS) policies reviewed for any new tables.
- [ ] Backup of the production database initiated (if performing major schema changes).

## Phase 2: Deployment
- [ ] 1. Apply Database Migrations (Run SQL scripts on Production Supabase).
- [ ] 2. Update Production Environment Variables (Vercel/Netlify/Hosting platform).
- [ ] 3. Trigger Frontend Build and Deploy.
- [ ] 4. Monitor the build logs for any unexpected warnings.

## Phase 3: Post-Deployment Smoke Test (Production)
Perform these manual checks immediately after deployment:
- [ ] **Site loads successfully:** No white screens or 500 errors on the homepage.
- [ ] **Login works:** Test login for one Admin, one Faculty, and one Student account.
- [ ] **Core feature works:** Faculty can create a dummy session and a Student can mark attendance. (Delete dummy data afterward).
- [ ] **Routing:** Ensure role-based routing restricts access properly (e.g., Student cannot navigate to `/admin`).

## Phase 4: Monitoring (Next 24 Hours)
- [ ] Check Supabase logs for failed API requests or RLS violations.
- [ ] Monitor application crash reporting (if integrated).
- [ ] Keep communication channels open for user bug reports.

## Rollback Plan
*   If the post-deployment smoke test fails, immediately revert the frontend deployment to the previous stable commit.
*   If database migrations caused data corruption, restore from the pre-deployment backup.
