# Degree Link - Course Equivalency and Transfer Planning System

**Production:** https://dlink.cs.uno.edu  
**Documentation:** https://mmennelle.github.io/degreelink

## What is Degree Link?

Degree Link helps students and academic advisors navigate the complex process of transferring between colleges. It solves three critical problems:

1. **Course Transfer Mapping** - Which courses from one institution count at another?
2. **Degree Requirement Tracking** - How do transferred courses fulfill specific program requirements?
3. **Progress Validation** - Are students meeting credit minimums, course counts, level requirements, and other constraints?

Students can create personalized degree plans, see real-time progress toward graduation, and identify which courses still need to be taken. Advisors can upload program requirements, manage course catalogs, and monitor student progress.

---

## For Students

### Getting Started

1. **Create Your Degree Plan**
   - Visit the system URL
   - Click "Create New Plan"
   - Enter your information and select your degree program
   - Save your unique 8-character plan code

2. **Add Courses**
   - Browse or search for courses
   - Add courses to your plan
   - System automatically checks prerequisites and constraints

3. **Track Your Progress**
   - View color-coded progress bars for each requirement
   - See which courses you still need
   - Check constraint satisfaction (credits, course counts, levels)

4. **Share with Your Advisor**
   - Give your plan code to your advisor
   - Your advisor can view and edit your plan
   - Download as PDF for advising appointments

### Key Features for Students

- **Real-time Progress Tracking** - See completion status for all degree requirements
- **Prerequisite Checking** - System warns if you're missing prerequisites
- **Course Equivalencies** - Transfer credits automatically recognized
- **Constraint Validation** - Ensures you meet credit minimums, course counts, level requirements
- **Course Suggestions** - Get recommendations based on completed prerequisites
- **Plan Sharing** - Share with advisors using your plan code
- **Download & Print** - Export your plan as PDF or CSV

**[Read the Complete Student Guide](docs/STUDENT_GUIDE.md)**

---

## For Advisors

### Getting Started

1. **Authenticate**
   - Click the Settings icon
   - Enter your whitelisted email
   - Scan QR code with authenticator app (first time)
   - Enter 6-digit code to sign in

2. **Upload Program Requirements**
   - Navigate to Upload tab
   - Select "Program Requirements"
   - Upload CSV file with requirements and constraints
   - Review preview and confirm

3. **Manage Student Plans**
   - Students share their plan codes with you
   - Enter plan code to view/edit student plans
   - Add or remove courses
   - Verify degree requirement satisfaction

### Key Features for Advisors

- **TOTP Authentication** - Secure login with authenticator apps (Google Authenticator, Authy, etc.)
- **CSV Upload System** - Bulk upload courses, equivalencies, and program requirements
- **Constraint Management** - Define credit minimums/maximums, course counts, level requirements, attribute requirements
- **Preview & Edit** - Review changes before confirming uploads
- **Student Plan Access** - View and edit student plans via plan codes
- **Real-time Validation** - Automatic checking of all requirements and constraints

**[Read the Complete Advisor Guide](docs/ADVISOR_GUIDE.md)**

**[View Program Requirements Upload Guide](docs/USER_GUIDE_PROGRAM_REQUIREMENTS.md)**

**[View CSV Format Specification](docs/CSV_FORMAT.md)**

---

## Documentation

### User Documentation
- **[Student Guide](docs/STUDENT_GUIDE.md)** - Complete guide for students
- **[Advisor Guide](docs/ADVISOR_GUIDE.md)** - Complete guide for advisors
- **[Program Requirements Upload Guide](docs/USER_GUIDE_PROGRAM_REQUIREMENTS.md)** - How to upload requirements
- **[CSV Format Specification](docs/CSV_FORMAT.md)** - CSV file format details

### Technical Documentation
- **[Technical Overview](docs/CURRENT_SYSTEM_STATUS.md)** - System architecture and features
- **[TOTP Authentication System](docs/ADVISOR_AUTH_IMPLEMENTATION.md)** - Authentication implementation
- **[Course Prerequisite System](docs/PREREQUISITE_IMPLEMENTATION.md)** - Prerequisite validation
- **[Requirement Constraint System](docs/CONSTRAINT_IMPLEMENTATION.md)** - Constraint validation
- **[Constraint Scoping](docs/GROUP_LEVEL_CONSTRAINTS.md)** - Category vs group-level constraints
- **[Admin Tokens and Plan Sessions](docs/admin-auth-and-sessions.md)** - API authentication

**[View Complete Documentation Index](docs/README.md)**

---

## Project Info

**Repository:** mmennelle/course-equivalency  
**Branch:** dev-main  
**License:** MIT License  
**Maintained by:** UNO Computer Science Department

---

## Support

For questions or issues:
- Review the [Student Guide](docs/STUDENT_GUIDE.md) or [Advisor Guide](docs/ADVISOR_GUIDE.md)
- Check the [Documentation](docs/) for detailed information
- Contact the UNO CS Department for technical support
