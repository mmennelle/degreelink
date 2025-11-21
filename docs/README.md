# Documentation Index

**Last Updated:** November 21, 2025

This directory contains all technical documentation for the Course Equivalency and Transfer Planning System.

---

## 📋 Start Here

### **[CURRENT_SYSTEM_STATUS.md](CURRENT_SYSTEM_STATUS.md)**
Complete system overview including:
- Current features and capabilities
- Architecture and file structure
- Environment configuration
- Deployment status
- Recent changes and known limitations

---

## 👥 User Documentation

### **[USER_GUIDE_PROGRAM_REQUIREMENTS.md](USER_GUIDE_PROGRAM_REQUIREMENTS.md)**
Guide for academic advisors and program administrators:
- How to prepare and upload CSV files
- Understanding constraints and requirements
- Managing existing requirements
- Complete examples and best practices
- Troubleshooting common issues

### **[UNIFIED_CSV_FORMAT.md](UNIFIED_CSV_FORMAT.md)**
CSV file format specification:
- Column definitions and examples
- Constraint types (credits, courses, level, tags)
- Category-level vs group-level constraints
- Sample data structures
- Migration from legacy formats

---

## 🔐 Authentication & Security

### **[ADVISOR_AUTH_IMPLEMENTATION.md](ADVISOR_AUTH_IMPLEMENTATION.md)**
Advisor authentication system details:
- Email verification with time-limited codes
- Security architecture and rationale
- API endpoints and frontend components
- Database schema and migrations
- Session management

### **[PRODUCTION_BACKDOOR.md](PRODUCTION_BACKDOOR.md)**
Temporary authentication for pre-SMTP deployment:
- Backdoor code: `089292`
- How it works and security considerations
- When and how to remove it
- SMTP configuration checklist

### **[admin-auth-and-sessions.md](admin-auth-and-sessions.md)**
Admin token and plan session authentication:
- Admin API token usage
- Plan-code session system
- Rate limiting and security
- Frontend integration

---

## 🎓 Core Features

### **[PREREQUISITE_IMPLEMENTATION.md](PREREQUISITE_IMPLEMENTATION.md)**
Course prerequisite validation system:
- Course-level prerequisites (not requirement-level)
- Transitive equivalency support
- API endpoints for validation
- BFS-based chain resolution
- CSV format for prerequisites

### **[CONSTRAINT_IMPLEMENTATION.md](CONSTRAINT_IMPLEMENTATION.md)**
Requirement constraint system:
- Database schema for constraints
- Credit exclusion for violating courses
- Validation API endpoints
- UI display and warnings
- Filtered course suggestions

### **[GROUP_LEVEL_CONSTRAINTS.md](GROUP_LEVEL_CONSTRAINTS.md)**
Category vs group-level constraint scoping:
- Constraint key structure
- Scope filter JSON format
- Group name filtering
- Subject code filtering
- Evaluation logic

---

## 📝 Implementation Details

### **[OPTION_A_IMPLEMENTATION.md](OPTION_A_IMPLEMENTATION.md)**
Requirement type restructuring:
- Removal of `conditional` type
- `simple` vs `grouped` semantics
- Changes to evaluation logic
- Backend model updates
- CSV upload validation

### **[UNIFIED_CSV_IMPLEMENTATION.md](UNIFIED_CSV_IMPLEMENTATION.md)**
Single CSV format for requirements + constraints:
- Problem statement and solution
- Backend parsing changes
- Frontend UI updates
- Constraint column details
- Backward compatibility

### **[SCOPE_DELIMITER_CHANGE.md](SCOPE_DELIMITER_CHANGE.md)**
Subject code delimiter change:
- From comma-separated to space-separated
- Rationale and benefits
- Code changes in backend and frontend
- Migration guide
- Examples

### **[UPLOAD_MODAL_EXTENSION.md](UPLOAD_MODAL_EXTENSION.md)**
Upload preview/confirm workflow:
- Preview endpoints for all CSV types
- Frontend modal enhancements
- Edit capabilities
- Change detection
- Error handling

---

## 🗄️ Database

### **[POSTGRESQL_MIGRATION.md](POSTGRESQL_MIGRATION.md)**
PostgreSQL migration from SQLite:
- Setup instructions
- Environment configuration
- Migration commands
- Troubleshooting
- **Status:** ✅ Completed

### **[MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md)**
PostgreSQL migration completion summary:
- Changes made
- Import path fixes
- Database permissions
- Verification steps
- **Status:** ✅ Complete

### **[MIGRATIONS_README.md](MIGRATIONS_README.md)**
Flask-Migrate (Alembic) usage:
- Basic commands
- Environment setup
- Migration workflow
- API testing examples

---

## 🗂️ Sample Data

### **[equic-csvs/](equic-csvs/)**
Sample CSV files and templates:
- DCC and UNO course catalogs
- Sample equivalencies
- Program requirement examples
- Constraint examples

---

## 🗃️ Archive

Historical documentation and outdated guides (see `archive/` directory):
- Old course transfer instructions
- Previous UI components
- Legacy CSV authoring guides
- Database update notes
- Old screenshots and writeups

---

## Documentation Status Legend

- ✅ **Current & Active** - Reflects current implementation
- 📚 **Historical Reference** - Completed migrations or past changes
- 🗄️ **Archived** - Superseded by newer documentation

---

## Contributing to Documentation

When updating documentation:

1. **Update the relevant document** with your changes
2. **Update CURRENT_SYSTEM_STATUS.md** if features/architecture changed
3. **Update this index** if you add/remove/move documents
4. **Add date stamps** to major updates
5. **Move outdated docs** to `archive/` rather than deleting

---

## Quick Reference

### Most Commonly Needed Docs

For advisors uploading data:
- Start with **USER_GUIDE_PROGRAM_REQUIREMENTS.md**
- Reference **UNIFIED_CSV_FORMAT.md** for column definitions

For developers working on features:
- Start with **CURRENT_SYSTEM_STATUS.md** for overview
- Check feature-specific docs (prerequisites, constraints, auth)

For deployment:
- **CURRENT_SYSTEM_STATUS.md** → Environment Configuration section
- **PRODUCTION_BACKDOOR.md** → SMTP setup instructions
- **ADVISOR_AUTH_IMPLEMENTATION.md** → Email configuration

---

## Document Maintenance

**Last Full Review:** November 21, 2025  
**Next Review Scheduled:** After SMTP configuration  
**Maintainer:** UNO CS Department
