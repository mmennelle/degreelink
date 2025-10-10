# Admin API Tokens and Plan Access Sessions

This document explains how admin API tokens are used, how plan-code sessions work, and how the frontend cooperates with both flows.

## Overview

The backend exposes operations under `/api`. There are two orthogonal access models:

- Admin token authentication (header `X-Admin-Token`)
  - Intended for trusted advisors/maintainers and batch operations (e.g., uploads, program management, creating plans).
  - Controlled by environment variable `ADMIN_API_TOKEN`.
- Plan access sessions (8-character plan code)
  - Intended for students and advisors who possess a specific plan's code.
  - A short-lived session is created after verifying a plan code and allows reading/updating that single plan.

These models can be used together: an admin can also operate within plan sessions, but admin token is not required for plan-scoped edits.

---

## Admin Token Authentication

File: `backend/auth.py`

- The `@require_admin` decorator protects routes that should only be accessible by admins.
- Server reads `ADMIN_API_TOKEN` from environment and compares it to the `X-Admin-Token` header.
- If `ADMIN_API_TOKEN` is not set, behavior is controlled by `ADMIN_FAIL_OPEN` (default `true`):
  - When `ADMIN_FAIL_OPEN=true`, the decorator allows requests through (development convenience).
  - Set `ADMIN_FAIL_OPEN=false` in production to enforce the token.

Example protected endpoints (subject to change):
- POST `/api/plans` (create plan)
- Upload routes: `/api/upload/...`
- Program management: version switching, requirements mutations

Frontend usage (file: `frontend/src/services/api.js`):
- The client will inject `X-Admin-Token` automatically if it finds a token via Vite env `VITE_ADMIN_API_TOKEN` or browser localStorage keys (`VITE_ADMIN_API_TOKEN`, `ADMIN_API_TOKEN`, `adminToken`).
- In development, the client logs a warning if it believes a request is protected but no admin token is available.

How to supply a token during development:
- Option 1 (Vite .env):
  - Create `frontend/.env.local` with `VITE_ADMIN_API_TOKEN=yourtokenvalue`.
- Option 2 (Browser localStorage):
  - In dev tools console: `localStorage.setItem('VITE_ADMIN_API_TOKEN', 'yourtokenvalue')` and reload.

---

## Plan-code Sessions

File: `backend/routes/plans.py`

- The primary access path for plans is via plan code endpoints:
  - GET `/api/plans/by-code/<PLANCODE>`
  - GET `/api/plans/verify-code/<PLANCODE>`
- A valid 8-character alphanumeric code identifies a plan. On successful lookup:
  - The server stores `session['accessed_plan_id']` and `session['access_time']`.
  - Session duration: 1 hour. After expiry, the session is cleared and access must be re-established by re-entering the code.

Access checks:
- Most plan-scoped routes check `check_plan_access(plan_id)` which verifies
  `session['accessed_plan_id'] == plan_id` and that the session has not expired.

Rate limiting:
- `require_plan_access` provides basic in-memory rate limiting (max ~10 attempts/hour per client IP) for code verification routes.

What plan-code sessions can do:
- Read plan data: GET `/api/plans/<id>`
- Read progress: GET `/api/plans/<id>/progress`
- Degree audit CSV: GET `/api/plans/<id>/degree-audit?format=csv`
- Manage courses under the plan:
  - POST `/api/plans/<id>/courses`
  - PUT `/api/plans/<id>/courses/<plan_course_id>`
  - DELETE `/api/plans/<id>/courses/<plan_course_id>`
- Update plan metadata (safe fields only): PUT `/api/plans/<id>`
  - Allowed fields: `plan_name`, `student_email`, `status`, `current_program_id`
  - Admin token is NOT required for this (as long as the user has plan-code session).

What plan-code sessions cannot do:
- Create or delete plans by browsing the index. Plan creation is admin-protected.
- Arbitrary program-level mutations (e.g., setting program versions, editing requirements) — these remain admin-only.

Session utilities:
- POST `/api/plans/session/clear` clears the session.
- GET `/api/plans/session/status` returns `{ has_access, plan_id, expires_in }` when available.

---

## Frontend Behavior

- Entering a plan code (Lookup page) calls `/api/plans/by-code/<code>`, which:
  - Returns plan data
  - Starts a plan session on the server (cookie-based session)
- After a session is active, the client can call plan-scoped endpoints without any admin token.
- Admin-only operations (e.g., creating plans or uploading data) still require `X-Admin-Token`.

Progress refresh:
- After course add/edit/remove, the UI bumps a lightweight counter causing `/api/plans/<id>/progress` to refetch immediately.

Modals and focus:
- When opening a new modal (edit plan, edit course, add courses, course search), the app automatically closes/backs out of other overlays for clean UX.

---

## Security Considerations & Recommendations

- Keep `ADMIN_API_TOKEN` long and secret. Rotate periodically.
- In production, set `ADMIN_FAIL_OPEN=false` to enforce admin checks.
- Treat plan codes as sensitive. Anyone with the code can access and modify that specific plan for the session duration.
- Consider storing plan codes securely and rotating if leaked (creating a new plan may be the simplest strategy today).
- In future, consider:
  - Redis-backed rate limiting and session storage
  - Shorter session durations or sliding expiration
  - Optional second-factor for plan updates (email OTP to student)

---

## Quick Reference

Environment variables (backend):
- `ADMIN_API_TOKEN`: required for admin routes when `ADMIN_FAIL_OPEN=false`
- `ADMIN_FAIL_OPEN`: `true` (default) or `false`; controls whether missing token fails open

Headers (frontend → backend):
- `X-Admin-Token`: included automatically by the frontend service if configured

Plan session lifecycle:
1. Client verifies/opens a plan by code
2. Server sets session cookies with `accessed_plan_id` and timestamp
3. Client can read/update plan-scoped resources without admin token until session expires
4. Session can be cleared via `/api/plans/session/clear`