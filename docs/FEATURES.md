# Course Equivalency System - Features

**Last Updated:** November 21, 2025

---

## Overview

The Course Equivalency and Transfer Planning System is a comprehensive web application designed to help students and academic advisors plan degree completion when transferring courses between institutions. The system manages course equivalencies, validates program requirements, and tracks student progress toward degree completion.

---

## Core Capabilities

### Course Equivalency Management

**Course Catalog**
- Maintain comprehensive course catalogs for multiple institutions
- Store course details including subject code, number, title, and credits
- Track course attributes such as labs, course types, and other metadata
- Support for cross-institutional course data

**Equivalency Mappings**
- Define which courses from different institutions are considered equivalent
- Bidirectional equivalency support (if A=B, then B=A)
- Transitive equivalency resolution (if A=B and B=C, then A=C)
- View and manage all equivalencies for any course

### Degree Program Management

**Program Definition**
- Create and maintain degree programs with multiple versions
- Support for different degree levels (Associate, Bachelor, Master, etc.)
- Version tracking for program requirements over time
- Institution-specific program catalogs

**Requirement Structure**
- Define degree requirements organized by categories (Core, Electives, etc.)
- Two requirement types:
  - **Simple Requirements:** Pool of courses where students choose any to meet credit goals
  - **Grouped Requirements:** Multiple mandatory subdivisions where all groups must be satisfied
- Flexible course grouping within requirements
- Credit hour tracking per requirement and group

### Requirement Constraints

**Credit Constraints**
- Define minimum and maximum credit requirements
- Apply at category level or specific group level
- Example: "Complete 10-15 credits from Biology electives"

**Course Count Constraints**
- Specify minimum and maximum number of courses
- Example: "Take 3-5 courses from this list"

**Level Constraints**
- Require minimum course level (e.g., 3000-level or higher)
- Specify minimum number of courses at that level
- Example: "At least 2 courses must be 3000-level or higher"

**Tag Constraints**
- Filter courses by specific attributes
- Example: "At least 2 courses must include labs"

**Subject Code Scoping**
- Limit constraint applicability to specific subject codes
- Example: "15 credits required, but only from Biology or Chemistry courses"

### Course Prerequisites

**Prerequisite Validation**
- Verify students have completed required prerequisites before taking courses
- Support for multiple prerequisite courses
- Automatic recognition of equivalent courses across institutions
- Clear prerequisite chains showing course dependencies

**Prerequisite Details**
- View all prerequisites for any course
- See equivalent courses that satisfy prerequisites
- Identify prerequisite courses from any institution in the system

### Transfer Planning

**Plan Creation**
- Create personalized degree plans for individual students
- Select target program and institution
- Generate unique plan access codes for student access
- Track plan metadata (student name, email, source institution)

**Course Assignment**
- Add courses to plans from any institution
- Automatic detection of equivalent courses
- Visual indicators for prerequisite satisfaction
- Constraint validation when adding courses

**Progress Tracking**
- Real-time calculation of requirement completion
- Visual progress indicators for each requirement category
- Credit hour tallies (completed vs required)
- Percentage completion displays
- Clear identification of satisfied vs unsatisfied requirements

**Constraint Validation**
- Automatic validation against all requirement constraints
- Visual indicators for constraint satisfaction
- Warning messages for constraint violations
- Course suggestions filtered by active constraints

### Plan Access and Sharing

**Student Access**
- Unique 8-character plan codes for access
- No login required for students
- 1-hour session duration
- QR code generation for easy mobile access

**Plan Export**
- Generate PDF documents of complete plans
- QR code inclusion for future access
- Professional formatting for advising sessions

### Data Upload and Import

**CSV Upload System**
- Import courses from spreadsheet files
- Upload course equivalencies in bulk
- Import complete program requirements with constraints
- Preview data before finalizing import
- Edit capabilities during upload confirmation
- Validation and error reporting

**Unified CSV Format**
- Single file format for requirements and constraints
- Column-based constraint specification
- Support for all constraint types
- Backward compatibility with legacy formats

### Administrative Features

**Advisor Authentication**
- Email-based advisor access
- Secure verification code system
- Time-limited access codes (15 minutes)
- Session management (1-hour sessions)
- Rate limiting and account lockout protection

**Whitelist Management**
- Administrator control of advisor access
- Add or remove advisor emails
- View active advisor sessions
- Audit trail of advisor additions

**Bulk Data Management**
- Upload and replace program requirements
- Update course catalogs
- Manage equivalency mappings
- Preview changes before applying

### Search and Discovery

**Course Search**
- Search courses by code, title, or institution
- Filter by subject codes
- View course details and equivalencies
- Identify available prerequisite courses

**Filtered Suggestions**
- Course suggestions based on completed prerequisites
- Constraint-aware filtering
- Next-course recommendations
- Progress-optimized suggestions

### Validation and Warnings

**Prerequisite Warnings**
- Alert when adding courses without completed prerequisites
- Show missing prerequisite courses
- Suggest equivalent courses that satisfy prerequisites

**Constraint Warnings**
- Identify courses that violate active constraints
- Exclude violating courses from suggestions
- Visual indicators in course selection interfaces

**Plan Validation**
- Comprehensive validation of entire plan
- Identify all unsatisfied requirements
- List missing prerequisites
- Highlight constraint violations

---

## User Interface Features

### Navigation
- Clean, intuitive interface
- Breadcrumb navigation
- Responsive design for desktop and mobile
- Dark mode support

### Visual Indicators
- Color-coded progress displays
- Checkmarks for satisfied requirements
- Warning icons for violations
- Percentage completion bars

### Interactive Elements
- Drag-and-drop course assignment
- Modal dialogs for course addition
- Expandable requirement sections
- Inline editing capabilities

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Clear visual hierarchy

---

## Security Features

### Authentication
- Multi-level access control (Admin, Advisor, Student)
- Token-based admin authentication
- Email verification for advisors
- Session expiration and management

### Data Protection
- Session-based access control
- Rate limiting on authentication attempts
- Automatic lockout after failed attempts
- Secure session token generation

### Privacy
- No permanent student accounts required
- Time-limited plan access
- Secure plan code generation
- No sensitive data storage

---

## System Capabilities

### Performance
- Fast requirement evaluation
- Efficient equivalency resolution
- Real-time progress calculation
- Optimized database queries

### Scalability
- Support for multiple institutions
- Unlimited programs and requirements
- Large course catalogs
- Extensive equivalency mappings

### Flexibility
- Configurable constraint types
- Custom requirement structures
- Adaptable to different degree programs
- Version control for program changes

### Reliability
- Database transaction safety
- Error handling and recovery
- Data validation at multiple levels
- Comprehensive logging

---

## Integration Points

### Data Import
- CSV file format support
- Bulk data operations
- Validation and error reporting

### Data Export
- PDF plan generation
- QR code creation
- Printable formats

### External Systems
- Email delivery for advisor codes
- QR code scanning support
- Standard web browser compatibility

---

## Supported Workflows

### For Students
1. Receive plan code from advisor
2. Access plan via web or QR code
3. View degree requirements and progress
4. See course equivalencies
5. Export plan as PDF

### For Advisors
1. Authenticate with email verification
2. Create student transfer plans
3. Add courses from any institution
4. Validate prerequisites and requirements
5. Share plan code with student
6. Upload program requirements
7. Manage course equivalencies

### For Administrators
1. Manage advisor whitelist
2. Upload course catalogs
3. Define program requirements
4. Configure system settings
5. Monitor system usage

---

## Technical Specifications

### Browser Support
- Modern web browsers (Chrome, Firefox, Safari, Edge)
- Mobile browser support
- No plugins or extensions required

### Data Formats
- CSV for data import
- PDF for plan export
- JSON API for integrations

### Platform Requirements
- Web-based application
- No installation required
- Internet connection needed

---

## Future Extensibility

The system architecture supports future enhancements including:
- Additional constraint types
- Enhanced reporting capabilities
- Degree audit automation
- Student collaboration features
- Integration with institutional systems
- Mobile application development
- Advanced analytics and insights

---

For technical documentation and implementation details, see the developer documentation in the docs/ directory.
