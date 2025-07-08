# Course Equivalency Finder

A comprehensive web application for managing course equivalencies between educational institutions, with program-based transfer planning and degree requirement tracking.

## Project Overview

The Course Equivalency Finder helps students, academic advisors, and educational institutions manage course transfer equivalencies and create comprehensive transfer plans. The system supports both simple course-to-course mapping and complex program-based planning with degree requirements and constraints.

## Key Features

- Browse courses hierarchically by institution, department, and program
- Discover equivalent courses between institutions
- Create and manage transfer plans with unique shareable codes
- Import program structures from CSV files
- Track degree completion progress with requirement analysis
- Support for complex degree constraints (choose 1, choose N, required courses)
- Real-time program completion analysis with visual feedback

## System Architecture

### Backend (Flask + SQLite)
- **Framework**: Flask with CORS support
- **Database**: SQLite with normalized relational design
- **Models**: Institution, Department, Course, Program, RequirementGroup, RequirementOption
- **Services**: Program analysis, CSV import, transfer plan management
- **API**: RESTful endpoints with proper MVC separation

### Frontend (React + Vite)
- **Framework**: React 18 with functional components and hooks
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: Custom hooks for data management
- **UI Pattern**: Component-based architecture with clear separation of concerns
- **Styling**: Inline CSS with responsive design

## Enhanced Database Schema

### Program Management Tables

#### Program
```sql
CREATE TABLE Program (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    degree_type TEXT NOT NULL,
    department_id INTEGER NOT NULL,
    institution_id INTEGER NOT NULL,
    description TEXT,
    total_credits INTEGER,
    UNIQUE(name, degree_type, department_id, institution_id)
);
```

#### RequirementGroup
```sql
CREATE TABLE RequirementGroup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    program_id INTEGER NOT NULL,
    total_credits INTEGER,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(name, program_id)
);
```

#### RequirementOption
```sql
CREATE TABLE RequirementOption (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requirement_group_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    credits INTEGER,
    is_required BOOLEAN DEFAULT 0,
    constraint_type TEXT DEFAULT 'elective',
    constraint_value INTEGER,
    sort_order INTEGER DEFAULT 0
);
```

## API Endpoints

### Enhanced Program Endpoints

#### `GET /api/programs?department_id={id}`
- Get all programs for a department
- Returns program list with degree types and credit requirements

#### `GET /api/programs/{id}/requirements`
- Get complete program structure with requirement groups and course options
- Includes constraint information and course details

#### `POST /api/programs/{id}/analyze`
- Analyze program completion based on selected courses
- Returns completion percentage, fulfilled requirements, and recommendations

#### `POST /api/programs/import`
- Import program structure from CSV file
- Supports complex requirement parsing with constraint detection

### Transfer Plan Management

#### `POST /api/create-program-plan`
- Create transfer plan with program-based requirements
- Includes completion analysis and progress tracking

#### `GET /api/get-program-plan/{code}`
- Retrieve program-based transfer plan with full analysis
- Returns source/target programs, completion status, and recommendations

## CSV Import Format

The system supports importing complex program structures from CSV files. Example format for degree programs:

```
Associate of Science Transfer Degree -- Biology Concentration
DCC COURSE,UNO EQUIV

English Composition (6 hours total)
choose 1,,choose 1
ENGL 101,ENGL 1157,ENGL 102,ENGL 1158

Mathematics (6 hours total)
choose 1,,choose 1
MATH 130,MATH 1125,MATH 131,MATH 1126

Humanities (9 hours total)
choose 1,,choose 2
ENGL 205,ENGL 2238,ARCH 180,no equiv
```

The import system automatically:
- Extracts program information from headers
- Parses requirement groups with credit totals
- Identifies constraint types (choose 1, choose N)
- Creates course equivalencies between institutions
- Builds complete program structure with requirements

## Component Architecture

### Program-Based Components

#### ProgramBrowsePage
- Enhanced browsing interface for program selection
- Hierarchical navigation: Institution → Department → Program → Requirements
- Real-time completion analysis as courses are selected

#### ProgramAnalysisView
- Visual progress tracking with completion percentages
- Requirement group status indicators
- Credit tracking and remaining requirements display

#### RequirementGroupView
- Expandable requirement group interface
- Constraint visualization (choose 1, choose N, required)
- Course selection with constraint validation

## Enhanced User Workflow

### Program-Based Transfer Planning

1. **Browse Programs**: Navigate to institution → department → program
2. **View Requirements**: See all requirement groups with constraints
3. **Select Courses**: Choose courses that fulfill specific requirements
4. **Track Progress**: Real-time analysis shows completion percentage
5. **Create Plan**: Save program-based transfer plan with completion data
6. **Share Plan**: Generate unique code for plan access and sharing

### Constraint Validation

The system validates degree requirements in real-time:
- **Choose 1**: Exactly one course from the group required
- **Choose N**: Specific number of courses from options
- **Required**: All courses in group must be taken
- **Elective**: Optional courses that count toward total credits

## Installation and Setup

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install flask flask-cors flask-sqlalchemy flask-migrate

# Initialize database
python init_db.py

# Run development server
python app.py
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## File Structure

```
course-equivalency-finder/
├── backend/
│   ├── app.py
│   ├── config/
│   │   └── settings.py
│   ├── models/
│   │   ├── base.py
│   │   ├── institution.py
│   │   ├── department.py
│   │   ├── course.py
│   │   ├── program.py
│   │   ├── requirement_group.py
│   │   ├── requirement_option.py
│   │   └── transfer_plan.py
│   ├── controllers/
│   │   ├── program_controller.py
│   │   ├── course_controller.py
│   │   └── transfer_plan_controller.py
│   ├── services/
│   │   ├── program_service.py
│   │   ├── program_import_service.py
│   │   └── transfer_plan_service.py
│   └── database/
│       └── connection.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── models/
│   │   │   ├── Program.js
│   │   │   ├── RequirementGroup.js
│   │   │   └── Course.js
│   │   ├── controllers/
│   │   │   └── ProgramController.js
│   │   ├── hooks/
│   │   │   ├── usePrograms.js
│   │   │   └── useProgramAnalysis.js
│   │   └── views/
│   │       ├── pages/
│   │       │   └── ProgramBrowsePage.jsx
│   │       └── components/
│   │           └── Program/
│   │               ├── ProgramAnalysisView.jsx
│   │               └── RequirementGroupView.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Technology Stack

### Backend
- Python 3.8+
- Flask web framework
- SQLite database
- SQLAlchemy ORM
- Flask-Migrate for database migrations

### Frontend
- React 18
- Vite build tool
- Axios for API communication
- Modern JavaScript (ES6+)

## Development Features

### MVC Architecture
- **Models**: Data structure and validation
- **Views**: UI components and presentation
- **Controllers**: Business logic and API coordination
- **Services**: Complex business operations and external integrations

### Error Handling
- Comprehensive validation on both client and server
- Graceful degradation for missing data
- User-friendly error messages
- Detailed logging for debugging

### Performance Optimizations
- Lazy loading of hierarchical data
- Efficient database queries with proper indexing
- Optimized bundle sizes with Vite
- Caching strategies for frequently accessed data

## Security Considerations

- Input validation and sanitization
- SQL injection prevention through parameterized queries
- CORS configuration for cross-origin requests
- Secure code generation for plan access
- No authentication required for basic functionality

## Production Deployment

The application can be deployed using:
- **Backend**: Gunicorn + Nginx for production serving
- **Frontend**: Static file serving with CDN support
- **Database**: PostgreSQL for production scaling
- **Monitoring**: Application and database performance monitoring

## Future Enhancements

### Planned Features
- User authentication and plan ownership
- Advanced search and filtering
- Integration with institutional student information systems
- Mobile application development
- Advanced analytics and reporting

### Technical Improvements
- GraphQL API for flexible data fetching
- Real-time collaboration on transfer plans
- Advanced caching with Redis
- Microservices architecture for scaling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the established MVC patterns
4. Add tests for new functionality
5. Submit a pull request with clear description

## License

This project is open source and available under the MIT License.

---

The Course Equivalency Finder demonstrates modern web development practices with emphasis on maintainable code, user experience, and scalable architecture. The program-based enhancement transforms simple course mapping into comprehensive degree planning with real-time progress tracking and constraint validation.