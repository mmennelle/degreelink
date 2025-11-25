# Course Equivalency System - Technical Documentation

**Last Updated:** November 25, 2025  
**Production Domain:** dlink.cs.uno.edu  
**Branch:** dev-main

---

## System Overview

The Course Equivalency and Transfer Planning System is a web application designed for academic advisors and students to manage course equivalencies, create degree plans, and track progress toward degree completion.

**Core Capabilities:**
- Course equivalency management between institutions
- Degree plan creation and tracking
- Prerequisite validation with transitive equivalency support
- Program requirement validation with constraints
- Progress monitoring and course suggestions

---

## Current Features

### 1. Authentication System

#### Advisor Authentication
- **TOTP-based:** Time-based One-Time Password using pyotp
- **Session Duration:** 1 hour
- **Authenticator Apps:** Google Authenticator, Authy, Microsoft Authenticator
- **Admin Privileges:** Advisors have full administrative access
- **Features:**
  - Email whitelist requirement
  - QR code generation for setup
  - Regenerate TOTP secret capability
  - 30-second code validity window
  - Fallback email code system

**API Endpoints:**
- `POST /api/advisor-auth/request-code` - Request TOTP setup or email code
- `POST /api/advisor-auth/verify-code` - Verify code and create session
- `POST /api/advisor-auth/regenerate-totp` - Generate new TOTP secret
- `GET /api/advisor-auth/verify-session` - Check session validity
- `POST /api/advisor-auth/logout` - Logout and clear session
- `GET /api/advisor-auth/whitelist` - List whitelisted advisors (admin only)
- `POST /api/advisor-auth/whitelist` - Add advisor (admin only)
- `POST /api/advisor-auth/whitelist/bulk` - Bulk add advisors via CSV (admin only)
- `DELETE /api/advisor-auth/whitelist/:id` - Remove advisor (admin only)

#### Admin API Token
- **Token-based:** `X-Admin-Token` header
- **Configuration:** `ADMIN_API_TOKEN` environment variable
- **Usage:** Backend operations, scripts, API testing

#### Plan Access Sessions
- **Code-based:** 8-character alphanumeric plan codes
- **Duration:** 1 hour
- **Scope:** Single plan read/write access
- **No authentication required** for students with plan code

### 2. Database

**Type:** PostgreSQL  
**Migration Tool:** Flask-Migrate (Alembic)

**Core Tables:**
- `courses` - Course catalog (all institutions)
- `equivalencies` - Course equivalency mappings
- `programs` - Degree programs with versions
- `program_requirements` - Requirement categories
- `requirement_groups` - Course groupings within requirements
- `group_course_options` - Specific course options for groups
- `requirement_constraints` - Validation rules (credits, courses, level, tags)
- `plans` - Individual student degree plans
- `plan_courses` - Courses assigned to plans
- `advisor_auth` - Advisor whitelist and authentication

### 3. Requirement System

#### Requirement Types
- **`simple`:** Pool of courses, choose any to meet credit goal
- **`grouped`:** Multiple mandatory subdivisions, must satisfy ALL groups

#### Constraint Types
Constraints can apply at category-level or group-level:

1. **Credits Constraint**
   - Min/max credit requirements
   - Example: "Complete 10-15 credits from BIOS electives"

2. **Course Count Constraint**
   - Min/max number of courses
   - Example: "Take 3-5 courses from this list"

3. **Level Constraint**
   - Minimum course level (e.g., 3000+ courses)
   - Min courses at that level
   - Example: "At least 2 courses must be 3000-level or higher"

4. **Tag Constraint**
   - Filter by course attributes (has_lab, course_type, etc.)
   - Example: "At least 2 courses must have labs"

5. **Subject Code Scope**
   - Limit constraints to specific subject codes (space-delimited)
   - Example: "15 credits required, but only from BIOS or CHEM courses"

**Constraint Features:**
- Automatic validation during plan evaluation
- Credit exclusion for violating courses
- Visual indicators in UI
- Filtered course suggestions based on constraints

### 4. Prerequisite System

**Location:** Course-level validation  
**Storage:** `courses.prerequisites` field (comma-separated)  
**Service:** `backend/services/prerequisite_service.py`

**Features:**
- Transitive equivalency support (if A=B and B→C, then A→C)
- BFS-based equivalency chain resolution
- Validation endpoints for checking course eligibility
- Suggestion engine for next courses based on completed prerequisites

**API Endpoints:**
- `GET /api/prerequisites/check/<course_code>?plan_id=X`
- `GET /api/prerequisites/details/<course_code>`
- `GET /api/prerequisites/validate-plan/<plan_id>`
- `GET /api/prerequisites/suggest-next-courses/<plan_id>`

### 5. CSV Upload System

**Upload Types:**
1. **Courses** - Course catalog entries
2. **Equivalencies** - Course equivalency mappings
3. **Program Requirements** - Requirements with embedded constraints

**Key Features:**
- Preview/confirm workflow for all upload types
- Edit capabilities in confirmation modal
- Constraint columns optional (first row only)
- Space-delimited subject codes
- Backward compatible with legacy formats

### 6. Progress Tracking

**Features:**
- Real-time progress calculation
- Constraint validation and visual indicators
- Satisfied vs unsatisfied constraint display
- Course-level constraint violation warnings
- Filtered course suggestions (respects constraints)
- Auto-refresh after course modifications

### 7. Frontend Architecture

**Framework:** React + Vite  
**Styling:** TailwindCSS  
**Key Components:**
- `AppShell.jsx` - Main navigation and layout
- `ProgressTracking.jsx` - Requirement progress display with constraint validation
- `AdvisorAuthModal.jsx` - Advisor authentication
- `AppManagementPage.jsx` - Admin whitelist management
- `CSVUpload.jsx` - File upload interface
- `AddCourseToPlanModal.jsx` - Course addition with validation

---

## File Structure

```
backend/
├── app.py                    # Flask application
├── config.py                 # Configuration
├── auth.py                   # Authentication decorators
├── models/
│   ├── course.py            # Course model
│   ├── equivalency.py       # Equivalency model
│   ├── program.py           # Program & requirement models
│   ├── constraint.py        # Constraint model
│   ├── plan.py              # Plan & plan_courses models
│   └── advisor_auth.py      # Advisor authentication
├── routes/
│   ├── courses.py           # Course endpoints
│   ├── equivalencies.py     # Equivalency endpoints
│   ├── programs.py          # Program endpoints
│   ├── plans.py             # Plan endpoints
│   ├── upload.py            # CSV upload endpoints
│   ├── qr.py                # QR code generation
│   ├── prerequisites.py     # Prerequisite validation
│   └── advisor_auth.py      # Advisor auth endpoints
└── services/
    ├── prerequisite_service.py   # Prerequisite logic
    └── progress_service.py       # Progress calculation

frontend/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── AppShell.jsx
│   │   ├── AdvisorAuthModal.jsx
│   │   ├── ProgressTracking.jsx
│   │   ├── CSVUpload.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── AppManagementPage.jsx
│   │   └── ...
│   └── services/
│       └── api.js
└── public/
```

---

## Environment Configuration

### Backend (.env)
```env
DATABASE_URL=postgresql://ct_user:DeptOfCs@localhost:5432/course_transfer
ADMIN_API_TOKEN=your_admin_token
FLASK_ENV=development
SECRET_KEY=your_secret_key
```

### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_ADMIN_API_TOKEN=your_admin_token
```

---

## Deployment Status

### Development
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`
- PostgreSQL database configured
- All migrations applied

### Production (dlink.cs.uno.edu)
- Backend and frontend deployed
- PostgreSQL database configured
- All migrations applied
- SMTP not configured - using backdoor code `089292` for advisor access
- See `PRODUCTION_BACKDOOR.md` for SMTP configuration steps

---

## Known Limitations

1. **TOTP Setup Required:** All advisors need to set up authenticator app on first login
   - Email code fallback available for troubleshooting
   - Use "Regenerate TOTP Secret" for device loss/transfer

2. **Session Storage:** Uses Flask server-side sessions
   - Not distributed across multiple backend instances
   - Use sticky sessions or Redis for load balancing

3. **File Upload Size:** Default Flask limits apply
   - Large CSV files may need configuration adjustment

---

## Testing

### Backend Tests
```bash
cd backend
pytest
```

**Test Coverage:**
- Model basic operations
- Grouped requirements and auto-assignment
- Constraint validation (credits, courses, level, tags)
- Prerequisite validation
- CSV upload and preview

### Frontend Build
```bash
cd frontend
npm run build
```

---

## Next Steps

### Immediate
1. Deploy to production (dlink.cs.uno.edu)
2. Whitelist all advisors and complete TOTP setup
3. Monitor authentication and system usage

### Short Term
1. Configure SMTP to remove backdoor code
2. Set up monitoring/logging for authentication
3. Create backup/recovery procedures for lost devices
4. Document common troubleshooting scenarios

### Long Term
1. Implement audit logging for advisor actions
2. Add plan sharing/collaboration features
3. Mobile-responsive improvements
4. Enhanced error tracking

---

## Contact & Support

**Development Team:** UNO CS Department  
**Repository:** mmennelle/course-equivalency  
**Branch:** dev-main  
**Production URL:** dlink.cs.uno.edu
