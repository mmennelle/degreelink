# Documentation Index

**Last Updated:** November 25, 2025

This directory contains all technical documentation for the Course Equivalency and Transfer Planning System.

---

## Start Here

### [Technical Documentation](CURRENT_SYSTEM_STATUS.md)
Complete technical overview:
- System architecture and features
- Authentication system (TOTP-based)
- Database schema and models
- API endpoints
- File structure
- Environment configuration
- Testing and deployment

---

## User Documentation

### [Student Guide](STUDENT_GUIDE.md)
Complete guide for students using the system:
- Creating and managing degree plans
- Adding courses and tracking progress
- Understanding prerequisites and constraints
- Working with course equivalencies
- Saving and sharing plans with advisors
- Downloading and printing plans
- Troubleshooting common issues

### [Advisor Guide](ADVISOR_GUIDE.md)
High-level guide for academic advisors:
- Getting started with the system
- Signing in with TOTP authentication
- Managing program requirements overview
- Working with student plans
- Security and best practices

### [Program Requirements Upload Guide](USER_GUIDE_PROGRAM_REQUIREMENTS.md)
Detailed guide for uploading program requirements:
- How to prepare and upload CSV files
- Understanding constraints and requirements
- Managing existing requirements
- Complete examples and best practices
- Troubleshooting common issues

### [CSV File Format Specification](CSV_FORMAT.md)
CSV file format specification:
- Column definitions and examples
- Constraint types (credits, courses, level, tags)
- Category-level vs group-level constraints
- Sample data structures
- Quick reference guide

---

## Authentication & Security

### [TOTP Authentication System](ADVISOR_AUTH_IMPLEMENTATION.md)
Advisor authentication system details:
- TOTP-based authentication
- Security architecture
- API endpoints and frontend components
- Database schema
- Session management

### [Admin Tokens and Plan Sessions](admin-auth-and-sessions.md)
Admin token and plan session authentication:
- Admin API token usage
- Plan-code session system
- Rate limiting and security
- Frontend integration

---

## Core Features

### [Course Prerequisite System](PREREQUISITE_IMPLEMENTATION.md)
Course prerequisite validation system:
- Course-level prerequisites
- Transitive equivalency support
- API endpoints for validation
- BFS-based chain resolution
- CSV format for prerequisites

### [Requirement Constraint System](CONSTRAINT_IMPLEMENTATION.md)
Requirement constraint system:
- Database schema for constraints
- Credit exclusion for violating courses
- Validation API endpoints
- UI display and warnings
- Filtered course suggestions

### [Constraint Scoping](GROUP_LEVEL_CONSTRAINTS.md)
Category vs group-level constraint scoping:
- Constraint key structure
- Scope filter JSON format
- Group name filtering
- Subject code filtering
- Evaluation logic

---

## Sample Data

### [Sample CSV Files](equic-csvs/)
Sample CSV files and templates:
- DCC and UNO course catalogs
- Sample equivalencies
- Program requirement examples
- Constraint examples

---

## Archive

Historical documentation (see `archive/` directory):
- Migration documentation
- Implementation change records
- Old UI components
- Legacy CSV guides
- Past system updates

---

## Quick Reference

**For students:**
- Start with [Student Guide](STUDENT_GUIDE.md)
- Learn how to create plans, add courses, and track progress

**For advisors uploading data:**
- Start with [Advisor Guide](ADVISOR_GUIDE.md)
- Reference [CSV File Format Specification](CSV_FORMAT.md) for column definitions

**For developers:**
- Start with [Technical Documentation](CURRENT_SYSTEM_STATUS.md) for system overview
- Check feature-specific docs (prerequisites, constraints, auth)

**For deployment:**
- [Technical Documentation](CURRENT_SYSTEM_STATUS.md) - Environment Configuration section
- [Production Backdoor Access](PRODUCTION_BACKDOOR.md) - SMTP setup instructions
- [TOTP Authentication System](ADVISOR_AUTH_IMPLEMENTATION.md) - Email configuration

---

## Contributing to Documentation

When updating documentation:

1. Update the relevant document with your changes
2. Update Technical Documentation if features/architecture changed
3. Update this index if you add/remove/move documents
4. Add date stamps to major updates
5. Move outdated docs to `archive/` rather than deleting

---

**Maintainer:** UNO CS Department  
**Repository:** mmennelle/course-equivalency  
**Branch:** dev-main
