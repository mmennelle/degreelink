# Course Equivalency System - Current Status

**Last Updated:** November 21, 2025  
**Production Domain:** dlink.cs.uno.edu  
**Branch:** auth-advisor

---

## System Overview

The Course Equivalency and Transfer Planning System is a web application designed for academic advisors and students to:
- Manage course equivalencies between institutions
- Create and track degree plans
- Validate prerequisites and program requirements
- Monitor student progress toward degree completion

---

## Current Features

### 1. Authentication System

#### Admin Authentication
- **Token-based:** `X-Admin-Token` header
- **Configuration:** `ADMIN_API_TOKEN` environment variable
- **Controls:** Upload operations, program management, advisor whitelist management
- **Decorator:** `@require_admin` (in `backend/auth.py`)

#### Advisor Authentication
- **Email-based:** Whitelisted email with 6-digit verification codes
- **Session Duration:** 1 hour
- **Backdoor Code:** `089292` (temporary, until SMTP configured)
- **Model:** `AdvisorAuth` (in `backend/models/advisor_auth.py`)
- **Decorator:** `@require_advisor` (in `backend/auth.py`)
- **Features:**
  - Email verification with time-limited codes (15 minutes)
  - Rate limiting (5 failed attempts → 30-minute lockout)
  - Session management with tokens
  - Admin interface for whitelist management

**Production Note:** Email sending is configured but SMTP server not yet set up for `dlink.cs.uno.edu`. Use backdoor code `089292` for any whitelisted email until SMTP is configured.

#### Plan Access Sessions
- **Code-based:** 8-character alphanumeric plan codes
- **Duration:** 1 hour
- **Scope:** Single plan read/write access
- **No authentication required** for students with plan code

### 2. Database

**Type:** PostgreSQL  
**Connection:** `postgresql://ct_user:***@localhost:5432/course_transfer`  
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

**Note:** `conditional` requirement type has been REMOVED. Prerequisites are now handled at the course level.

#### Constraint Types
Constraints can apply at category-level OR group-level:

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
   - Limit constraints to specific subject codes
   - Example: "15 credits required, but only from BIOS or CHEM courses"

### 4. Prerequisite System

**Location:** Course-level (not requirement-level)  
**Storage:** `courses.prerequisites` field (comma-separated)  
**Service:** `backend/services/prerequisite_service.py`

**Features:**
- Transitive equivalency support (if A=B and B→C, then A→C)
- BFS-based equivalency chain resolution
- Validation endpoints for checking if student can take a course
- Suggestion engine for next courses based on completed prerequisites

**API Endpoints:**
- `GET /api/prerequisites/check/<course_code>?plan_id=X`
- `GET /api/prerequisites/details/<course_code>`
- `GET /api/prerequisites/validate-plan/<plan_id>`
- `GET /api/prerequisites/suggest-next-courses/<plan_id>`

### 5. CSV Upload System

**Unified Format:** Single CSV for requirements + constraints (no separate files needed)

**Upload Types:**
1. **Courses** - Course catalog entries
2. **Equivalencies** - Course equivalency mappings
3. **Program Requirements** - Requirements with embedded constraints

**Key Features:**
- Preview/confirm workflow for all upload types
- Edit capabilities in confirmation modal
- Constraint columns optional (first row only)
- Space-delimited subject codes (not comma-delimited)
- Backward compatible with legacy formats

**Scope Delimiter:** Space-separated subject codes (e.g., `BIOS CHEM PHYS`)  
**Previous Format:** Comma-separated (deprecated)

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
- `ProgressTracking.jsx` - Requirement progress display
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
│   └── advisor_auth.py      # Advisor auth endpoints ✨ NEW
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
- **SMTP not configured** - Using backdoor code `089292`
- Ready for deployment after SMTP setup
- See `PRODUCTION_BACKDOOR.md` for SMTP configuration steps

---

## Recent Major Changes

### November 2025
- Added advisor authentication system with email verification
- Implemented backdoor code for pre-SMTP deployment
- Removed `conditional` requirement type
- Moved prerequisites to course-level
- Added transitive equivalency support for prerequisites
- Implemented group-level and category-level constraints
- Changed scope delimiter from comma to space

---

## Known Limitations

1. **Email Delivery:** SMTP server not configured for dlink.cs.uno.edu domain
   - **Workaround:** Use backdoor code `089292`
   - **Resolution:** Configure SMTP with UNO IT

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

## Documentation Index

### Current & Relevant
- **CURRENT_SYSTEM_STATUS.md** (this file) - System overview
- **PRODUCTION_BACKDOOR.md** - Backdoor code for pre-SMTP deployment
- **ADVISOR_AUTH_IMPLEMENTATION.md** - Advisor authentication details
- **UNIFIED_CSV_FORMAT.md** - CSV format specification
- **USER_GUIDE_PROGRAM_REQUIREMENTS.md** - User guide for advisors
- **PREREQUISITE_IMPLEMENTATION.md** - Prerequisite system details
- **CONSTRAINT_IMPLEMENTATION.md** - Constraint system details
- **GROUP_LEVEL_CONSTRAINTS.md** - Group vs category constraints

### Historical Reference
- **POSTGRESQL_MIGRATION.md** - PostgreSQL migration (completed)
- **MIGRATION_COMPLETE.md** - Migration completion status
- **OPTION_A_IMPLEMENTATION.md** - Requirement type restructuring
- **SCOPE_DELIMITER_CHANGE.md** - Delimiter change rationale
- **UNIFIED_CSV_IMPLEMENTATION.md** - CSV unification details
- **UPLOAD_MODAL_EXTENSION.md** - Upload UI improvements
- **admin-auth-and-sessions.md** - Admin & plan session auth
- **csv-authoring-grouped-requirements.md** - Legacy CSV guide
- **MIGRATIONS_README.md** - Flask-Migrate setup

### Archived
- **docs/archive/** - Old documentation and screenshots

---

## Next Steps

### Immediate (Pre-Production)
1. Debug logging active in advisor auth (intentional for deployment testing)
2. Test production build (successful)
3. Deploy to dlink.cs.uno.edu
4. Add initial advisor emails to whitelist

### Short Term (Post-Deployment)
1. Configure SMTP with UNO IT
2. Remove backdoor code after SMTP works
3. Set up monitoring/logging
4. Create admin documentation

### Long Term
1. Add more robust error tracking
2. Implement audit logging for advisor actions
3. Add plan sharing/collaboration features
4. Mobile-responsive improvements

---

## Contact & Support

**Development Team:** UNO CS Department  
**Repository:** mmennelle/course-equivalency  
**Branch:** auth-advisor  
**Production URL:** dlink.cs.uno.edu
