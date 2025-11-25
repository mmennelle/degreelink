# GitHub Wiki Structure - Developer Documentation

This file outlines the recommended structure for the GitHub Wiki for developer documentation.

---

## Recommended Wiki Pages

### Home Page
- Link to main README.md
- Quick navigation to key pages
- System overview diagram
- Recent updates/changelog

---

### **Getting Started** (Category)

#### 1. Development Setup
- Clone repository
- Backend setup (Python, venv, dependencies)
- Frontend setup (Node, npm, Vite)
- Database setup (PostgreSQL, migrations)
- Environment variables
- Running locally

#### 2. Deployment Guide
- Production deployment steps
- Caddy/Gunicorn configuration
- Database migration in production
- Environment configuration
- Systemd service setup

---

### **Architecture** (Category)

#### 3. System Architecture
- High-level system diagram
- Frontend architecture (React, Vite, Tailwind)
- Backend architecture (Flask, SQLAlchemy)
- Database schema overview
- Authentication flow diagrams

#### 4. Database Schema
- Entity relationship diagrams
- Table descriptions
- Column details
- Relationships and foreign keys
- Migration strategy

#### 5. API Reference
- Endpoint documentation
- Request/response formats
- Authentication requirements
- Error codes and handling

---

### **Authentication** (Category)

#### 6. Advisor Authentication Implementation
- TOTP authentication flow
- Email whitelist system
- Session management
- Security considerations
- Frontend integration
- Backend implementation details

*Source: ADVISOR_AUTH_IMPLEMENTATION.md*

#### 7. Authentication Decorators
- @require_admin decorator
- @require_advisor decorator
- Plan access sessions
- Token validation logic

*Source: PRODUCTION_BACKDOOR.md, admin-auth-and-sessions.md*

---

### **Features** (Category)

#### 8. Prerequisite System
- Course-level prerequisites
- Transitive equivalency support
- Validation logic (BFS algorithm)
- API endpoints
- Frontend validation
- Testing strategy

*Source: PREREQUISITE_IMPLEMENTATION.md*

#### 9. Constraint System
- Constraint types (credits, courses, level, tags)
- Category-level vs group-level constraints
- Validation logic
- Scope filtering
- CSV format for constraints
- Progress calculation

*Source: CONSTRAINT_IMPLEMENTATION.md, GROUP_LEVEL_CONSTRAINTS.md*

#### 10. Progress Tracking
- Real-time calculation
- Constraint satisfaction checking
- Visual indicators
- Auto-refresh behavior

*Source: From CURRENT_SYSTEM_STATUS.md, progress_service.py*

#### 11. CSV Upload System
- Unified CSV format
- Upload types (courses, equivalencies, requirements)
- Preview/confirm workflow
- Validation logic
- Error handling

*Source: UNIFIED_CSV_FORMAT.md, UNIFIED_CSV_IMPLEMENTATION.md*

#### 12. Advisor-Student Linking
- Plan code system
- Session management
- Access control
- Sharing workflow

*Source: ADVISOR_STUDENT_LINKING.md*

---

### **Database & Migrations** (Category)

#### 13. Database Migrations
- Flask-Migrate setup
- Creating migrations
- Applying migrations
- Rollback procedures
- Common issues

*Source: MIGRATIONS_README.md*

#### 14. PostgreSQL Migration (Historical)
- SQLite → PostgreSQL migration
- Lessons learned
- Data migration strategy

*Source: POSTGRESQL_MIGRATION.md, MIGRATION_COMPLETE.md*

---

### **Code Guidelines** (Category)

#### 15. Contributing Guidelines
- Code style
- Git workflow
- Pull request process
- Testing requirements
- Documentation standards

#### 16. Testing Guide
- Backend tests (pytest)
- Test structure
- Running tests
- Coverage requirements
- Adding new tests

---

### **Historical Reference** (Category)

#### 17. Design Decisions
- Requirement type changes (Option A)
- Scope delimiter change (comma → space)
- Conditional requirements removal
- Upload modal improvements

*Source: OPTION_A_IMPLEMENTATION.md, SCOPE_DELIMITER_CHANGE.md, UPLOAD_MODAL_EXTENSION.md*

#### 18. Legacy Documentation
- Old CSV formats
- Deprecated features
- Migration guides

*Source: docs/archive/*

---

## Migration Plan

### Phase 1: Keep in Repo
Keep these essential docs in `/docs`:
- **README.md** - Quick start and navigation
- **CURRENT_SYSTEM_STATUS.md** - Living system overview
- **ADVISOR_GUIDE.md** - Non-technical advisor guide
- **USER_GUIDE_PROGRAM_REQUIREMENTS.md** - End-user CSV guide
- **UNIFIED_CSV_FORMAT.md** - CSV specification

### Phase 2: Move to Wiki
Move these implementation docs to Wiki:
- ADVISOR_AUTH_IMPLEMENTATION.md → Wiki: "Advisor Authentication Implementation"
- PREREQUISITE_IMPLEMENTATION.md → Wiki: "Prerequisite System"
- CONSTRAINT_IMPLEMENTATION.md → Wiki: "Constraint System"
- GROUP_LEVEL_CONSTRAINTS.md → Wiki: "Constraint System" (merge with above)
- ADVISOR_STUDENT_LINKING.md → Wiki: "Advisor-Student Linking"
- MIGRATIONS_README.md → Wiki: "Database Migrations"
- PRODUCTION_BACKDOOR.md → Wiki: "Authentication Decorators" (merge with auth)
- admin-auth-and-sessions.md → Wiki: "Authentication Decorators"

### Phase 3: Archive Historical
Move to Wiki under "Historical Reference":
- POSTGRESQL_MIGRATION.md
- MIGRATION_COMPLETE.md
- OPTION_A_IMPLEMENTATION.md
- SCOPE_DELIMITER_CHANGE.md
- UNIFIED_CSV_IMPLEMENTATION.md
- UPLOAD_MODAL_EXTENSION.md
- DOC_REVIEW_SUMMARY.md

### Phase 4: Create New Content
Write new Wiki pages:
- Home page with navigation
- Development Setup (detailed)
- Deployment Guide
- System Architecture (diagrams)
- Database Schema (ERD)
- API Reference (comprehensive)
- Contributing Guidelines
- Testing Guide

---

## Wiki Navigation Structure

```
Home
├── Getting Started
│   ├── Development Setup
│   └── Deployment Guide
├── Architecture
│   ├── System Architecture
│   ├── Database Schema
│   └── API Reference
├── Authentication
│   ├── Advisor Authentication Implementation
│   └── Authentication Decorators
├── Features
│   ├── Prerequisite System
│   ├── Constraint System
│   ├── Progress Tracking
│   ├── CSV Upload System
│   └── Advisor-Student Linking
├── Database & Migrations
│   ├── Database Migrations
│   └── PostgreSQL Migration (Historical)
├── Code Guidelines
│   ├── Contributing Guidelines
│   └── Testing Guide
└── Historical Reference
    ├── Design Decisions
    └── Legacy Documentation
```

---

## Implementation Steps

1. **Create Wiki in GitHub repo**
2. **Create Home page** with navigation
3. **Create category pages** (Getting Started, Architecture, etc.)
4. **Copy content** from existing .md files to Wiki pages
5. **Add navigation links** between related pages
6. **Update main README.md** with links to Wiki
7. **Archive old docs** in docs/archive/
8. **Create stub pages** for new content (Development Setup, etc.)

---

## Benefits of Wiki Structure

✅ **Easier Maintenance**
- Edit documentation without git commits
- Quick updates for configuration changes
- No need to rebuild/redeploy for doc updates

✅ **Better Organization**
- Clear category structure
- Easy navigation with sidebar
- Search functionality across all pages

✅ **Cleaner Repository**
- Less clutter in main codebase
- Focus on code, not historical docs
- Keep only essential user-facing docs in repo

✅ **Better Collaboration**
- Team members can edit wiki directly
- Version history preserved
- Discussion on wiki pages

✅ **Public Access**
- Can make wiki public even if repo is private
- Share documentation with external users
- No need to clone repo to read docs

---

*Generated: November 25, 2025*
