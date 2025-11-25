# Degree Link - Course Equivalency and Transfer Planning System

**Production:** https://dlink.cs.uno.edu

## What is Degree Link?

Degree Link helps students and academic advisors navigate the complex process of transferring between colleges. It solves three critical problems:

1. **Course Transfer Mapping** - Which courses from one institution count at another?
2. **Degree Requirement Tracking** - How do transferred courses fulfill specific program requirements?
3. **Progress Validation** - Are students meeting credit minimums, course counts, level requirements, and other constraints?

Students can create personalized degree plans, see real-time progress toward graduation, and identify which courses still need to be taken. Advisors can upload program requirements, manage course catalogs, and monitor student progress.

---

## How It Works

### For Students
- **Browse Courses** - Search course catalogs from multiple institutions
- **Find Equivalencies** - See which courses transfer between schools
- **Create Plans** - Build semester-by-semester degree plans
- **Track Progress** - Real-time validation of degree requirements and constraints
- **Check Prerequisites** - Ensure courses are taken in the right order

### For Advisors
- **Secure Authentication** - TOTP-based login (Google Authenticator, Authy, etc.)
- **Upload Requirements** - CSV-based program requirement management
- **Manage Catalogs** - Add courses and equivalency mappings
- **View Student Plans** - Access student plans via shared plan codes
- **Validate Progress** - Real-time constraint checking (credits, course counts, levels, attributes)

### Key Features
- **Prerequisite Validation** - Automatic checking of course prerequisites with transitive equivalency support
- **Constraint Engine** - Validates credit requirements, course counts, upper-level minimums, and course attributes (labs, etc.)
- **Flexible Requirements** - Supports simple (required courses) and grouped (choose X from Y) requirements
- **Real-time Progress** - Instant feedback as students add/remove courses from plans

---

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and other settings

# Initialize database
flask db upgrade

# Run development server
flask run
```

### Frontend Setup
```bash
cd frontend
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev

# Build for production
npm run build
```

---

## Technology Stack

**Backend:**
- Flask (Python web framework)
- PostgreSQL (database)
- SQLAlchemy (ORM)
- Flask-Migrate (database migrations)
- pyotp (TOTP authentication)

**Frontend:**
- React (UI framework)
- Vite (build tool)
- TailwindCSS (styling)
- React Router (navigation)

---

## Documentation

📚 **[View Full Documentation on GitHub Wiki](../../wiki)**

- **[Advisor Guide](docs/ADVISOR_GUIDE.md)** - Complete guide for academic advisors
- **[User Guide - Program Requirements](docs/USER_GUIDE_PROGRAM_REQUIREMENTS.md)** - How to upload and manage program requirements
- **[CSV Format Guide](docs/UNIFIED_CSV_FORMAT.md)** - CSV file format specification
- **[System Status](docs/CURRENT_SYSTEM_STATUS.md)** - Current features and architecture

### Developer Documentation
- System Architecture
- API Reference
- Database Schema
- Authentication Implementation
- Constraint System
- Prerequisite System
- Contributing Guidelines

*Full developer documentation available on the [GitHub Wiki](../../wiki)*

---

## Project Info

**Repository:** mmennelle/course-equivalency  
**Branch:** dev-main  
**License:** MIT License  
**Maintained by:** UNO Computer Science Department

---

## Support

For questions or issues:
- Check the [GitHub Wiki](../../wiki) for documentation
- Review the [User Guides](docs/) for end-user documentation
- Contact the UNO CS Department for technical support
