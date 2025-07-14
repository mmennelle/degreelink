# Course Transfer System - Technical Documentation

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Development Setup](#development-setup)
7. [Deployment Guide](#deployment-guide)
8. [Testing Strategy](#testing-strategy)
9. [Security Considerations](#security-considerations)
10. [Performance Optimization](#performance-optimization)
11. [Troubleshooting](#troubleshooting)

---

## System Architecture

### Overview
The Course Transfer System is a full-stack web application built with a Flask REST API backend and React frontend. The system manages course catalogs, transfer equivalencies, academic programs, and student transfer plans.

### Technology Stack

**Backend**:
- **Framework**: Flask 2.x with Flask-SQLAlchemy ORM
- **Database**: SQLite (development), PostgreSQL (production recommended)
- **API Design**: RESTful architecture with JSON responses
- **File Handling**: CSV upload processing with pandas/csv
- **CORS**: Flask-CORS for cross-origin requests
- **Migration**: Flask-Migrate for database schema management

**Frontend**:
- **Framework**: React 18+ with functional components and hooks
- **Build Tool**: Vite for development and bundling
- **Styling**: Tailwind CSS utility-first framework
- **Icons**: Lucide React icon library
- **HTTP Client**: Native fetch API with custom service layer
- **State Management**: React useState/useEffect hooks

**Development Tools**:
- **Package Management**: npm/yarn (frontend), pip (backend)
- **Code Organization**: Modular component architecture
- **Environment**: Separate development and production configurations

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │────│   Flask API     │────│   SQLite/PostgreSQL
│   (Port 5173)   │    │   (Port 5000)   │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Data Flow**:
1. User interactions in React components
2. API calls through service layer
3. Flask route handlers process requests
4. SQLAlchemy ORM interacts with database
5. JSON responses back to frontend
6. State updates trigger UI re-renders

---

## Backend Implementation

### Project Structure

```
backend/
├── app.py                 # Flask application factory
├── config.py             # Configuration classes
├── models/               # SQLAlchemy model definitions
│   ├── __init__.py       # Database initialization
│   ├── course.py         # Course model
│   ├── program.py        # Program and requirement models
│   ├── plan.py           # Student plan models
│   └── equivalency.py    # Course equivalency model
└── routes/               # API route handlers
    ├── __init__.py       # Route registration
    ├── courses.py        # Course management endpoints
    ├── programs.py       # Program management endpoints
    ├── plans.py          # Student plan endpoints
    ├── equivalencies.py  # Equivalency management endpoints
    └── upload.py         # CSV upload endpoints
```

### Flask Application Configuration

**app.py** - Application Factory Pattern:
```python
def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///course_transfer.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB file upload limit
    
    # Initialize extensions
    CORS(app)  # Enable cross-origin requests
    db = init_app(app)  # Initialize SQLAlchemy
    register_routes(app)  # Register API blueprints
    
    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    # Database creation
    with app.app_context():
        db.create_all()
    
    return app
```

**Configuration Classes** (config.py):
- `Config`: Base configuration with common settings
- `DevelopmentConfig`: Debug mode, SQLite database
- `ProductionConfig`: Production optimizations, PostgreSQL
- `TestingConfig`: In-memory database for testing

### Database Models

#### Core Model Relationships

```python
# Core entity relationships
Course 1---* Equivalency *---1 Course (from/to relationship)
Program 1---* ProgramRequirement 1---* RequirementGroup 1---* GroupCourseOption
Program 1---* Plan 1---* PlanCourse *---1 Course
ProgramRequirement 1---* RequirementGroup
```

#### Course Model (models/course.py)

```python
class Course(db.Model):
    __tablename__ = 'courses'
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), nullable=False, index=True)  # e.g., "BIOL 101"
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    credits = db.Column(db.Integer, nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100))
    prerequisites = db.Column(db.Text)  # Comma-separated course codes
    
    # Audit fields
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    equivalent_from = db.relationship('Equivalency', foreign_keys='Equivalency.from_course_id', backref='from_course')
    equivalent_to = db.relationship('Equivalency', foreign_keys='Equivalency.to_course_id', backref='to_course')
    
    def validate(self):
        """Validation logic for course data"""
        errors = []
        if not self.code or len(self.code.strip()) == 0:
            errors.append("Course code is required")
        if not self.title or len(self.title.strip()) == 0:
            errors.append("Course title is required")
        if not self.credits or self.credits <= -1:
            errors.append("Credits must be a positive number")
        if not self.institution or len(self.institution.strip()) == 0:
            errors.append("Institution is required")
        return errors
```

#### Program and Requirements Models (models/program.py)

**Program Model**:
```python
class Program(db.Model):
    __tablename__ = 'programs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)  # e.g., "Biology Major"
    degree_type = db.Column(db.String(50), nullable=False)  # BS, BA, AS, etc.
    institution = db.Column(db.String(100), nullable=False)
    total_credits_required = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    
    # Relationships
    requirements = db.relationship('ProgramRequirement', backref='program', cascade='all, delete-orphan')
    plans = db.relationship('Plan', backref='program')
```

**ProgramRequirement Model** - Supports three types:
1. **Simple**: Basic credit requirement (e.g., "32 credits of Core Biology")
2. **Grouped**: Choose X from Y options (e.g., "Choose 2 from Literature Group")
3. **Conditional**: Complex logic-based requirements

```python
class ProgramRequirement(db.Model):
    __tablename__ = 'program_requirements'
    
    id = db.Column(db.Integer, primary_key=True)
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    category = db.Column(db.String(100), nullable=False)  # e.g., "Humanities", "Core Biology"
    credits_required = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    requirement_type = db.Column(db.String(50), default='simple')  # simple, grouped, conditional
    is_flexible = db.Column(db.Boolean, default=False)
    priority_order = db.Column(db.Integer, default=0)
    
    # Relationships for grouped requirements
    groups = db.relationship('RequirementGroup', backref='requirement', cascade='all, delete-orphan')
    
    def evaluate_completion(self, student_courses):
        """Evaluate if requirement is satisfied by student's courses"""
        if self.requirement_type == 'simple':
            return self._evaluate_simple_requirement(student_courses)
        elif self.requirement_type == 'grouped':
            return self._evaluate_grouped_requirement(student_courses)
        # ... implementation details
```

**RequirementGroup Model** - For complex grouped requirements:
```python
class RequirementGroup(db.Model):
    __tablename__ = 'requirement_groups'
    
    id = db.Column(db.Integer, primary_key=True)
    requirement_id = db.Column(db.Integer, db.ForeignKey('program_requirements.id'), nullable=False)
    group_name = db.Column(db.String(100), nullable=False)  # e.g., "Literature & Writing"
    courses_required = db.Column(db.Integer, nullable=False)  # Number of courses needed
    credits_required = db.Column(db.Integer)  # Alternative: credit-based requirement
    min_credits_per_course = db.Column(db.Integer, default=0)
    max_credits_per_course = db.Column(db.Integer)
    description = db.Column(db.Text)
    is_required = db.Column(db.Boolean, default=True)
    
    # Course options for this group
    course_options = db.relationship('GroupCourseOption', backref='group', cascade='all, delete-orphan')
```

#### Plan Models (models/plan.py)

**Plan Model** - Student academic plans:
```python
class Plan(db.Model):
    __tablename__ = 'plans'
    
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(200), nullable=False)
    student_email = db.Column(db.String(200))
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    plan_name = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='draft')  # draft, active, completed
    created_at = db.Column(db.DateTime, server_default=func.now())
    updated_at = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    courses = db.relationship('PlanCourse', backref='plan', cascade='all, delete-orphan')
    
    def calculate_progress(self):
        """Complex progress calculation algorithm"""
        # Defensive programming against missing data
        program = getattr(self, 'program', None)
        requirements = getattr(program, 'requirements', []) if program else []
        required_credits = getattr(program, 'total_credits_required', 0) or 0

        # Calculate completed credits
        total_credits = sum(
            (course.credits or (course.course.credits if course.course else 0) or 0)
            for course in self.courses
            if course.status == 'completed'
        )

        # Analyze courses by status
        completed_courses = [course for course in self.courses if course.status == 'completed']
        planned_courses = [course for course in self.courses if course.status == 'planned']
        in_progress_courses = [course for course in self.courses if course.status == 'in_progress']

        # Category breakdown analysis
        category_breakdown = {}
        for course in completed_courses:
            category = course.requirement_category or 'Uncategorized'
            if category not in category_breakdown:
                category_breakdown[category] = {
                    'courses': [],
                    'total_credits': 0,
                    'course_count': 0
                }
            # ... detailed breakdown logic
        
        # Return comprehensive progress data
        return {
            'total_credits_earned': total_credits,
            'total_credits_required': required_credits,
            'completion_percentage': completion_percentage,
            'remaining_credits': max(0, required_credits - total_credits),
            'category_breakdown': category_breakdown,
            'requirement_progress': requirement_progress,
            # ... additional metrics
        }
```

**PlanCourse Model** - Junction table with additional plan-specific data:
```python
class PlanCourse(db.Model):
    __tablename__ = 'plan_courses'
    
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    
    # Scheduling information
    semester = db.Column(db.String(50))  # Fall, Spring, Summer
    year = db.Column(db.Integer)
    
    # Academic information
    status = db.Column(db.String(50), default='planned')  # planned, in_progress, completed
    grade = db.Column(db.String(10))  # A, B+, C, etc.
    credits = db.Column(db.Integer)  # Override course credits if needed
    requirement_category = db.Column(db.String(100))  # Which requirement this fulfills
    notes = db.Column(db.Text)
    
    # Relationships
    course = db.relationship('Course', backref='plan_courses')
```

#### Equivalency Model (models/equivalency.py)

```python
class Equivalency(db.Model):
    __tablename__ = 'equivalencies'
    
    id = db.Column(db.Integer, primary_key=True)
    from_course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    to_course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    equivalency_type = db.Column(db.String(50), default='direct')  # direct, partial, conditional, no_equiv
    notes = db.Column(db.Text)
    approved_by = db.Column(db.String(100))  # Who approved this equivalency
    approved_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint to prevent duplicate mappings
    __table_args__ = (db.UniqueConstraint('from_course_id', 'to_course_id', name='unique_equivalency'),)
```

### API Route Implementation

#### Course Routes (routes/courses.py)

**Course Search with Advanced Filtering**:
```python
@bp.route('', methods=['GET'])
def get_courses():
    # Extract query parameters
    search = request.args.get('search', '')
    institution = request.args.get('institution', '')
    department = request.args.get('department', '')
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)  # Limit page size
    
    # Build query with filters
    query = Course.query
    
    if search:
        query = query.filter(
            or_(
                Course.code.ilike(f'%{search}%'),
                Course.title.ilike(f'%{search}%'),
                Course.description.ilike(f'%{search}%')
            )
        )
    
    if institution:
        query = query.filter(Course.institution.ilike(f'%{institution}%'))
    
    if department:
        query = query.filter(Course.department.ilike(f'%{department}%'))
    
    # Implement pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    courses = pagination.items
    
    return jsonify({
        'courses': [course.to_dict() for course in courses],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    })
```

**Course Details with Equivalency Information**:
```python
@bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course = Course.query.get_or_404(course_id)
    
    # Get all equivalency records for this course
    all_equivalencies = Equivalency.query.filter_by(from_course_id=course_id).all()
    
    if not all_equivalencies:
        return jsonify({
            'course': course.to_dict(),
            'equivalency_status': 'not_evaluated',
            'message': 'No equivalency information available for this course',
            'equivalencies': []
        })
    
    # Categorize equivalencies
    no_equiv_records = []
    transfer_equivalencies = []
    
    for equiv in all_equivalencies:
        if equiv.to_course and equiv.to_course.code == '1000NE':  # Special "no equivalent" marker
            no_equiv_records.append({
                'type': 'no_equivalent',
                'equivalency': equiv.to_dict(),
                'message': 'This course does not transfer'
            })
        elif equiv.to_course:
            transfer_equivalencies.append({
                'type': 'equivalent_to',
                'course': equiv.to_course.to_dict(),
                'equivalency': equiv.to_dict()
            })
    
    # Determine overall status
    if no_equiv_records and not transfer_equivalencies:
        status = 'no_transfer'
        message = 'Course has been evaluated and does not transfer'
    elif transfer_equivalencies:
        status = 'has_equivalents'
        message = f'Course has {len(transfer_equivalencies)} equivalent(s)'
    else:
        status = 'unknown'
        message = 'Equivalency records exist but are unclear'
    
    return jsonify({
        'course': course.to_dict(),
        'equivalency_status': status,
        'message': message,
        'equivalencies': transfer_equivalencies + no_equiv_records
    })
```

#### Plan Routes (routes/plans.py)

**Plan Creation with Validation**:
```python
@bp.route('', methods=['POST'])
def create_plan():
    data = request.get_json()
    
    # Validate required fields
    if not data.get('student_name'):
        return jsonify({'error': 'Student name is required'}), 400
    if not data.get('plan_name'):
        return jsonify({'error': 'Plan name is required'}), 400
    
    # Verify program exists
    program = Program.query.get(data.get('program_id'))
    if not program:
        return jsonify({'error': 'Program not found'}), 404
    
    plan = Plan(
        student_name=data.get('student_name'),
        student_email=data.get('student_email'),
        program_id=data.get('program_id'),
        plan_name=data.get('plan_name'),
        status=data.get('status', 'draft')
    )
    
    try:
        db.session.add(plan)
        db.session.commit()
        return jsonify(plan.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create plan'}), 500
```

**Advanced Plan Details with Progress Calculation**:
```python
@bp.route('/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    plan = Plan.query.get_or_404(plan_id)
    
    # Serialize base plan data
    plan_data = plan.to_dict()
    
    # Add computed fields
    plan_data['progress'] = plan.calculate_progress()
    plan_data['unmet_requirements'] = plan.get_unmet_requirements()
    plan_data['course_suggestions'] = plan.suggest_courses_for_requirements()
    
    return jsonify(plan_data)
```

#### CSV Upload Routes (routes/upload.py)

**Course Upload with Error Handling**:
```python
@bp.route('/courses', methods=['POST'])
def upload_courses():
    # File validation
    if 'file' not in request.files:
        return jsonify({'error': 'File not Given'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'file not selected'}), 400
    
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        # Parse CSV with error tracking
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        courses_created = 0
        courses_updated = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Extract and validate data
                code = row.get('code', '').strip()
                title = row.get('title', '').strip()
                
                if not code or not title:
                    errors.append(f"Row {row_num}: Missing required code or title")
                    continue
                
                # Check for existing course
                existing_course = Course.query.filter_by(
                    code=code,
                    institution=row.get('institution', '').strip()
                ).first()
                
                if existing_course:
                    # Update existing course
                    existing_course.title = title
                    existing_course.description = row.get('description', '').strip()
                    existing_course.credits = int(row.get('credits', 0))
                    existing_course.department = row.get('department', '').strip()
                    existing_course.prerequisites = row.get('prerequisites', '').strip()
                    courses_updated += 1
                else:
                    # Create new course
                    course = Course(
                        code=code,
                        title=title,
                        description=row.get('description', '').strip(),
                        credits=int(row.get('credits', 0)),
                        institution=row.get('institution', '').strip(),
                        department=row.get('department', '').strip(),
                        prerequisites=row.get('prerequisites', '').strip()
                    )
                    
                    # Validate course data
                    validation_errors = course.validate()
                    if validation_errors:
                        errors.append(f"Row {row_num}: {', '.join(validation_errors)}")
                        continue
                    
                    db.session.add(course)
                    courses_created += 1
                    
            except ValueError as e:
                errors.append(f"Row {row_num}: Invalid data format - {str(e)}")
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        # Commit changes if any successful operations
        if courses_created > 0 or courses_updated > 0:
            db.session.commit()
        
        return jsonify({
            'message': 'Upload completed',
            'courses_created': courses_created,
            'courses_updated': courses_updated,
            'errors': errors
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500
```

---

## Frontend Implementation

### Project Structure

```
frontend/src/
├── main.jsx              # Application entry point
├── App.jsx               # Main application component
├── index.css             # Tailwind CSS imports
├── components/           # React components
│   ├── CourseSearch.jsx  # Course search and discovery
│   ├── PlanBuilder.jsx   # Academic plan management
│   ├── ProgressTracker.jsx # Degree progress tracking
│   ├── CSVUpload.jsx     # Bulk data upload
│   ├── CreatePlanModal.jsx # Plan creation modal
│   └── AddCourseToPlanModal.jsx # Course addition modal
└── services/
    └── api.js            # API service layer
```

### Application Architecture

**App.jsx** - Main application controller:
```jsx
const App = () => {
  // Global state management
  const [activeTab, setActiveTab] = useState('search');
  const [userMode, setUserMode] = useState('student');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [planRefreshTrigger, setPlanRefreshTrigger] = useState(0);
  
  // Modal state for course addition
  const [addCourseModal, setAddCourseModal] = useState({
    isOpen: false,
    courses: [],
    plan: null,
    program: null
  });

  // Navigation tabs configuration
  const tabs = [
    { id: 'search', label: 'Course Search', icon: Search },
    { id: 'plans', label: 'Academic Plans', icon: FileText },
    ...(userMode === 'advisor' ?
    [{ id: 'upload', label: 'CSV Upload', icon: Upload }] : []),
  ];

  // Load initial data
  React.useEffect(() => {
    loadPlansAndPrograms();
  }, []);

  // Unified handler for adding courses to plan
  const handleAddToPlan = async (courses) => {
    if (!selectedPlanId) {
      alert('Please select a plan first.');
      return;
    }

    try {
      // Refresh the selected plan before opening the modal
      const refreshedPlan = await api.getPlan(selectedPlanId);
      
      // Get matching program based on refreshed plan's program_id
      const refreshedProgram = programs.find(p => p.id === refreshedPlan.program_id) 
        || await api.getProgram(refreshedPlan.program_id);

      // Ensure courses is an array
      const coursesArray = Array.isArray(courses) ? courses : [courses];

      setAddCourseModal({
        isOpen: true,
        courses: coursesArray,
        plan: refreshedPlan,
        program: refreshedProgram
      });

    } catch (error) {
      console.error('Failed to load latest plan or program:', error);
      alert('Could not load plan data. Please try again.');
    }
  };

  // ... rest of component implementation
};
```

### API Service Layer (services/api.js)

**Centralized HTTP Client**:
```javascript
class ApiService {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }
  
  // Course management methods
  async searchCourses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/courses${queryString ? `?${queryString}` : ''}`);
  }

  async getCourse(id) {
    return this.request(`/courses/${id}`);
  }

  // Plan management methods
  async getPlans(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/plans${queryString ? `?${queryString}` : ''}`);
  }

  async getPlan(id) {
    return this.request(`/plans/${id}`);
  }

  async createPlan(data) {
    return this.request('/plans', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async addCourseToPlan(planId, data) {
    return this.request(`/plans/${planId}/courses`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // File upload methods
  async uploadCourses(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/upload/courses', {
      method: 'POST',
      headers: {}, // Let browser set multipart headers
      body: formData
    });
  }

  // ... additional methods
}

const api = new ApiService();
export default api;
```

### Component Implementations

#### CourseSearch Component

**Key Features**:
- Advanced search with multiple filters
- Real-time requirement category detection
- Multi-select functionality
- Equivalency information display
- Integration with plan management

**State Management**:
```jsx
const CourseSearch = ({ 
  onCourseSelect = null, 
  onMultiSelect = null, 
  planId = '', 
  setPlanId = null,
  onAddToPlan = null,
  program = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [institution, setInstitution] = useState('');
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [detectedCategories, setDetectedCategories] = useState(new Map());
  const [plans, setPlans] = useState([]);
```

**Intelligent Category Detection**:
```jsx
// Detect categories for each course based on program requirements
if (program && program.requirements && searchResults.length > 0) {
  const categoryMap = new Map();
  
  searchResults.forEach(course => {
    let detectedCategory = 'Elective';
    
    // Check if course matches any requirement group
    const match = program.requirements.find(req => {
      if (req.groups) {
        return req.groups.some(g => 
          g.course_options && 
          g.course_options.some(opt => opt.course_code === course.code)
        );
      }
      return false;
    });
    
    if (match) {
      detectedCategory = match.category;
    } else {
      // Try to match by department/subject code
      const courseSubject = course.code.match(/^[A-Z]+/)?.[0];
      if (courseSubject) {
        const deptMatch = program.requirements.find(req => {
          const reqName = req.category.toLowerCase();
          return (
            (courseSubject === 'BIOL' && reqName.includes('bio')) ||
            (courseSubject === 'CHEM' && reqName.includes('chem')) ||
            (courseSubject === 'MATH' && reqName.includes('math')) ||
            (courseSubject === 'PHYS' && reqName.includes('phys')) ||
            (courseSubject === 'ENG' && (reqName.includes('english') || reqName.includes('composition'))) ||
            // ... additional subject mappings
          );
        });
        if (deptMatch) detectedCategory = deptMatch.category;
      }
    }
    
    categoryMap.set(course.id, detectedCategory);
  });
  
  setDetectedCategories(categoryMap);
}
```

**Multi-Course Selection Logic**:
```jsx
const toggleCourseSelection = (course) => {
  const isSelected = selectedCourses.some((c) => c.id === course.id);
  if (isSelected) {
    setSelectedCourses(selectedCourses.filter((c) => c.id !== course.id));
  } else {
    // Add course with detected category
    const courseWithCategory = {
      ...course,
      detectedCategory: detectedCategories.get(course.id) || 'Elective'
    };
    setSelectedCourses([...selectedCourses, courseWithCategory]);
  }
};

const handleAddSelected = () => {
  if (onMultiSelect && selectedCourses.length > 0) {
    onMultiSelect(selectedCourses);
    setSelectedCourses([]);
  }
};
```

#### AddCourseToPlanModal Component

**Complex Course Assignment Logic**:
```jsx
const AddCourseToPlanModal = ({ 
  isOpen, 
  onClose, 
  courses = [], 
  plan,
  program,
  onCoursesAdded 
}) => {
  // Initialize form data for each course with smart defaults
  const initializeCourseData = () => {
    return courses.map(course => {
      let suggestedCategory = course.detectedCategory || 'Free Electives';
      let suggestedGroup = null;

      if (program && program.requirements) {
        // Find matching category by group membership
        const match = program.requirements.find(req => {
          if (req.groups) {
            const groupMatch = req.groups.find(g =>
              g.course_options?.some(opt => opt.course_code === course.code)
            );
            if (groupMatch) {
              suggestedGroup = groupMatch;
              suggestedCategory = req.category;
              return true;
            }
          }
          return false;
        });
      }

      return {
        course,
        requirement_category: suggestedCategory,
        requirement_group_id: suggestedGroup?.id || null,
        semester: 'Fall',
        year: new Date().getFullYear(),
        status: 'planned',
        grade: '',
        notes: ''
      };
    });
  };

  // State management for bulk operations
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [planCourses, setPlanCourses] = useState([]);
  const [requirementStatus, setRequirementStatus] = useState({});
  
  // Global settings for bulk operations
  const [applyToAll, setApplyToAll] = useState({
    semester: false,
    year: false,
    status: false,
    requirement_category: false
  });
```

**Requirement Status Calculation**:
```jsx
const calculateRequirementStatus = (currentCourses) => {
  if (!program || !program.requirements) return;

  const status = {};
  
  program.requirements.forEach(req => {
    const categoryStatus = {
      category: req.category,
      type: req.requirement_type,
      totalRequired: req.credits_required,
      totalCompleted: 0,
      groups: {}
    };

    // Get courses in this requirement category
    const categoryCourses = currentCourses.filter(c => 
      c.requirement_category === req.category
    );

    // Calculate total credits completed
    categoryStatus.totalCompleted = categoryCourses.reduce((sum, c) => 
      sum + (c.credits || c.course.credits || 0), 0
    );

    // Handle grouped requirements
    if (req.requirement_type === 'grouped' && req.groups) {
      req.groups.forEach(group => {
        // Find courses that match this specific group
        const groupCourses = categoryCourses.filter(planCourse => {
          return group.course_options?.some(opt => 
            opt.course_code === planCourse.course.code
          );
        });

        categoryStatus.groups[group.id] = {
          name: group.group_name,
          coursesRequired: group.courses_required,
          coursesCompleted: groupCourses.length,
          creditsRequired: group.credits_required,
          creditsCompleted: groupCourses.reduce((sum, c) => 
            sum + (c.credits || c.course.credits || 0), 0
          ),
          isFull: false
        };

        // Check if group is full
        if (group.courses_required) {
          categoryStatus.groups[group.id].isFull = 
            groupCourses.length >= group.courses_required;
        } else if (group.credits_required) {
          categoryStatus.groups[group.id].isFull = 
            categoryStatus.groups[group.id].creditsCompleted >= group.credits_required;
        }
      });
    }

    status[req.category] = categoryStatus;
  });

  setRequirementStatus(status);
};
```

**Course Assignment Validation**:
```jsx
const validateCourseAssignment = (courseIndex) => {
  const data = courseData[courseIndex];
  const requirement = program?.requirements?.find(req => 
    req.category === data.requirement_category
  );

  if (!requirement) return { valid: true };

  const categoryStatus = requirementStatus[data.requirement_category];
  if (!categoryStatus) return { valid: true };

  // Check if category is already full
  if (categoryStatus.totalCompleted >= categoryStatus.totalRequired) {
    return {
      valid: false,
      error: `${data.requirement_category} requirement already has ${categoryStatus.totalCompleted} of ${categoryStatus.totalRequired} required credits`
    };
  }

  // For grouped requirements, check specific group constraints
  if (requirement.requirement_type === 'grouped' && data.requirement_group_id) {
    const groupStatus = categoryStatus.groups[data.requirement_group_id];
    if (groupStatus && groupStatus.isFull) {
      return {
        valid: false,
        error: `${groupStatus.name} group already has the required ${
          groupStatus.coursesRequired ? 
          `${groupStatus.coursesRequired} course(s)` : 
          `${groupStatus.creditsRequired} credits`
        }`
      };
    }
  }

  return { valid: true };
};
```

**Bulk Operation Handling**:
```jsx
const updateCourseField = (index, field, value) => {
  const updated = [...courseData];
  updated[index][field] = value;
  
  // If changing requirement category, reset group selection
  if (field === 'requirement_category') {
    updated[index].requirement_group_id = null;
    
    // Auto-select group if only one available
    const availableGroups = getAvailableGroups(index);
    if (availableGroups.length === 1) {
      updated[index].requirement_group_id = availableGroups[0].id;
    }
  }
  
  // If "apply to all" is checked for this field, update all courses
  if (applyToAll[field]) {
    updated.forEach((data, i) => {
      if (i !== index) {
        data[field] = value;
        if (field === 'requirement_category') {
          data.requirement_group_id = null;
        }
      }
    });
  }
  
  setCourseData(updated);
};

const toggleApplyToAll = (field) => {
  const newApplyToAll = { ...applyToAll, [field]: !applyToAll[field] };
  setApplyToAll(newApplyToAll);
  
  // If turning on, apply the first course's value to all
  if (!applyToAll[field] && courseData.length > 0) {
    const value = courseData[0][field];
    const updated = courseData.map(data => ({ ...data, [field]: value }));
    setCourseData(updated);
  }
};
```

#### ProgressTracker Component

**Comprehensive Progress Analysis**:
```jsx
const ProgressTracker = ({ plan }) => {
  if (!plan || !plan.progress) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="mr-2" size={20} />
          Degree Progress
        </h3>
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>Progress information not available</p>
        </div>
      </div>
    );
  }

  const progress = plan.progress;
  const unmetRequirements = plan.unmet_requirements || [];
  const completionPercentage = Math.min(progress.completion_percentage || 0, 100);
  const isCompleted = completionPercentage >= 100;
```

**Course Grouping and Analysis**:
```jsx
const groupCoursesByRequirement = (courses) => {
  const grouped = {};
  courses.forEach(course => {
    const category = course.requirement_category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(course);
  });
  return grouped;
};

const getRequirementProgress = (category) => {
  const courses = coursesByRequirement[category] || [];
  const completedCourses = courses.filter(c => c.status === 'completed');
  const inProgressCourses = courses.filter(c => c.status === 'in_progress');
  const plannedCourses = courses.filter(c => c.status === 'planned');
  
  const completedCredits = completedCourses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0);
  const inProgressCredits = inProgressCourses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0);
  const plannedCredits = plannedCourses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0);
  
  return {
    completed: completedCredits,
    inProgress: inProgressCredits,
    planned: plannedCredits,
    total: completedCredits + inProgressCredits + plannedCredits,
    courses: courses
  };
};
```

**Dynamic Progress Visualization**:
```jsx
const getProgressColor = (percentage) => {
  if (percentage >= 100) return 'from-green-500 to-emerald-500';
  if (percentage >= 75) return 'from-blue-500 to-green-500';
  if (percentage >= 50) return 'from-yellow-500 to-blue-500';
  if (percentage >= 25) return 'from-orange-500 to-yellow-500';
  return 'from-red-500 to-orange-500';
};

const getProgressMessage = (percentage) => {
  if (percentage >= 100) return 'Congratulations! All requirements completed!';
  if (percentage >= 75) return 'You\'re almost there! Keep up the great work!';
  if (percentage >= 50) return 'Great progress! You\'re halfway there!';
  if (percentage >= 25) return 'Good start! Continue building your plan!';
  return 'This is the beginning of an incredible journey!';
};
```

#### CSVUpload Component

**Multi-Type Upload Handling**:
```jsx
const CSVUpload = () => {
  const [uploadType, setUploadType] = useState('courses');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // File validation
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadResult({ 
        error: 'Please upload a CSV file (.csv extension required)' 
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadResult({ 
        error: 'File size too large. Please upload files smaller than 10MB.' 
      });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      let result;
      switch (uploadType) {
        case 'courses':
          result = await api.uploadCourses(file);
          break;
        case 'equivalencies':
          result = await api.uploadEquivalencies(file);
          break;
        case 'requirements':
          result = await api.uploadRequirements(file);
          break;
        default:
          throw new Error('Invalid upload type');
      }
      
      setUploadResult(result);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResult({ error: error.message });
    } finally {
      setUploading(false);
    }
  };
```

**Drag and Drop Implementation**:
```jsx
const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);
  
  const file = e.dataTransfer.files[0];
  if (file) {
    handleFileUpload(file);
  }
};

const handleDrag = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.type === 'dragenter' || e.type === 'dragover') {
    setDragActive(true);
  } else if (e.type === 'dragleave') {
    setDragActive(false);
  }
};
```

**Sample CSV Generation**:
```jsx
const downloadSampleCSV = (type) => {
  let csvContent, filename;
  
  if (type === 'courses') {
    csvContent = `code,title,description,credits,institution,department,prerequisites
"BIOL 101","Introduction to Biology","Fundamental principles of biology including cell structure, genetics, and evolution.",4,"Community College","Biology",""
"MATH 151","Calculus I","Limits, derivatives, and applications of differential calculus.",4,"Community College","Mathematics","MATH 141"
// ... additional sample data
`;
    filename = 'sample_courses.csv';
  } else if (type === 'equivalencies') {
    csvContent = `from_course_code,from_institution,to_course_code,to_institution,equivalency_type,notes,approved_by
"BIOL 101","Community College","BIO 1010","State University","direct","Direct transfer equivalency","Dr. Smith"
// ... additional sample data
`;
    filename = 'sample_equivalencies.csv';
  } else if (type === 'requirements') {
    csvContent = `program_name,category,credits_required,requirement_type,group_name,courses_required,credits_required_group,course_option,institution,is_preferred,description,group_description,option_notes
"Biology Major","Humanities",9,"grouped","Literature & Writing",2,6,"ENG 201","State University","true","Liberal arts breadth requirement","Choose 2 literature/writing courses","Advanced composition"
// ... additional sample data
`;
    filename = 'sample_program_requirements.csv';
  }

  // Create and download blob
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     courses     │       │  equivalencies  │       │     courses     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ from_course_id  │       │ id (PK)         │
│ code            │       │ to_course_id    ├──────►│ code            │
│ title           │       │ equivalency_type│       │ title           │
│ description     │       │ notes           │       │ description     │
│ credits         │       │ approved_by     │       │ credits         │
│ institution     │       │ approved_date   │       │ institution     │
│ department      │       │ created_at      │       │ department      │
│ prerequisites   │       └─────────────────┘       │ prerequisites   │
│ created_at      │                                 │ created_at      │
│ updated_at      │                                 │ updated_at      │
└─────────────────┘                                 └─────────────────┘
                                                    
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    programs     │       │     plans       │       │   plan_courses  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ program_id      │       │ id (PK)         │
│ name            │       │ id (PK)         │◄──────┤ plan_id         │
│ degree_type     │       │ student_name    │       │ course_id       ├──┐
│ institution     │       │ student_email   │       │ semester        │  │
│ total_credits_  │       │ plan_name       │       │ year            │  │
│   required      │       │ status          │       │ status          │  │
│ description     │       │ created_at      │       │ grade           │  │
│ created_at      │       │ updated_at      │       │ credits         │  │
│ updated_at      │       └─────────────────┘       │ requirement_    │  │
└─────────────────┘                                 │   category      │  │
         │                                          │ notes           │  │
         │                                          └─────────────────┘  │
         ▼                                                               │
┌─────────────────┐                                                     │
│program_require- │                                                     │
│     ments       │                                                     │
├─────────────────┤                                                     │
│ id (PK)         │                                                     │
│ program_id      │                                                     │
│ category        │                                                     │
│ credits_required│                                                     │
│ description     │                                                     │
│ requirement_type│                                                     │
│ is_flexible     │                                                     │
│ priority_order  │                                                     │
└─────────────────┘                                                     │
         │                                                              │
         ▼                                                              │
┌─────────────────┐                                                     │
│requirement_     │                                                     │
│     groups      │                                                     │
├─────────────────┤                                                     │
│ id (PK)         │                                                     │
│ requirement_id  │                                                     │
│ group_name      │                                                     │
│ courses_required│                                                     │
│ credits_required│                                                     │
│ min_credits_per_│                                                     │
│   course        │                                                     │
│ max_credits_per_│                                                     │
│   course        │                                                     │
│ description     │                                                     │
│ is_required     │                                                     │
└─────────────────┘                                                     │
         │                                                              │
         ▼                                                              │
┌─────────────────┐                                          ┌─────────▼───────┐
│group_course_    │                                          │     courses     │
│    options      │                                          ├─────────────────┤
├─────────────────┤                                          │ id (PK)         │
│ id (PK)         │                                          │ code            │
│ group_id        │                                          │ title           │
│ course_code     │──────────────────────────────────────────│ description     │
│ institution     │                                          │ credits         │
│ is_preferred    │                                          │ institution     │
│ notes           │                                          │ department      │
└─────────────────┘                                          │ prerequisites   │
                                                             │ created_at      │
                                                             │ updated_at      │
                                                             └─────────────────┘
```

### Table Specifications

#### courses
```sql
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    institution VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    prerequisites TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_institution ON courses(institution);
CREATE INDEX idx_courses_department ON courses(department);
```

#### equivalencies
```sql
CREATE TABLE equivalencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_course_id INTEGER NOT NULL,
    to_course_id INTEGER NOT NULL,
    equivalency_type VARCHAR(50) DEFAULT 'direct',
    notes TEXT,
    approved_by VARCHAR(100),
    approved_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_course_id) REFERENCES courses(id),
    FOREIGN KEY (to_course_id) REFERENCES courses(id),
    UNIQUE(from_course_id, to_course_id)
);

CREATE INDEX idx_equivalencies_from_course ON equivalencies(from_course_id);
CREATE INDEX idx_equivalencies_to_course ON equivalencies(to_course_id);
```

#### programs
```sql
CREATE TABLE programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    degree_type VARCHAR(50) NOT NULL,
    institution VARCHAR(100) NOT NULL,
    total_credits_required INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### program_requirements
```sql
CREATE TABLE program_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    credits_required INTEGER NOT NULL,
    description TEXT,
    requirement_type VARCHAR(50) DEFAULT 'simple',
    is_flexible BOOLEAN DEFAULT FALSE,
    priority_order INTEGER DEFAULT 0,
    FOREIGN KEY (program_id) REFERENCES programs(id)
);
```

#### requirement_groups
```sql
CREATE TABLE requirement_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requirement_id INTEGER NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    courses_required INTEGER NOT NULL,
    credits_required INTEGER,
    min_credits_per_course INTEGER DEFAULT 0,
    max_credits_per_course INTEGER,
    description TEXT,
    is_required BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (requirement_id) REFERENCES program_requirements(id)
);
```

#### group_course_options
```sql
CREATE TABLE group_course_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    institution VARCHAR(100),
    is_preferred BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (group_id) REFERENCES requirement_groups(id)
);
```

#### plans
```sql
CREATE TABLE plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name VARCHAR(200) NOT NULL,
    student_email VARCHAR(200),
    program_id INTEGER NOT NULL,
    plan_name VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id)
);
```

#### plan_courses
```sql
CREATE TABLE plan_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    semester VARCHAR(50),
    year INTEGER,
    status VARCHAR(50) DEFAULT 'planned',
    grade VARCHAR(10),
    credits INTEGER,
    requirement_category VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (plan_id) REFERENCES plans(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE INDEX idx_plan_courses_plan ON plan_courses(plan_id);
CREATE INDEX idx_plan_courses_course ON plan_courses(course_id);
CREATE INDEX idx_plan_courses_status ON plan_courses(status);
```

---

## API Reference

### Base Configuration
- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **Error Format**: `{"error": "Error message"}`
- **Success Format**: `{"data": {...}}`

### Course Endpoints

#### GET /api/courses
Search and retrieve courses with pagination.

**Query Parameters**:
- `search` (string): Search term for code, title, or description
- `institution` (string): Filter by institution name
- `department` (string): Filter by department
- `page` (integer): Page number (default: 1)
- `per_page` (integer): Results per page (default: 20, max: 100)

**Response**:
```json
{
  "courses": [
    {
      "id": 1,
      "code": "BIOL 101",
      "title": "Introduction to Biology",
      "description": "Fundamental principles of biology...",
      "credits": 4,
      "institution": "Community College",
      "department": "Biology",
      "prerequisites": "MATH 120",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

#### GET /api/courses/{id}
Get detailed course information including equivalencies.

**Response**:
```json
{
  "course": {
    "id": 1,
    "code": "BIOL 101",
    "title": "Introduction to Biology",
    "description": "Fundamental principles of biology...",
    "credits": 4,
    "institution": "Community College",
    "department": "Biology",
    "prerequisites": "MATH 120",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  },
  "equivalency_status": "has_equivalents",
  "message": "Course has 2 equivalent(s)",
  "equivalencies": [
    {
      "type": "equivalent_to",
      "course": {
        "id": 2,
        "code": "BIO 1010",
        "title": "General Biology I",
        "credits": 4,
        "institution": "State University"
      },
      "equivalency": {
        "id": 1,
        "equivalency_type": "direct",
        "notes": "Direct transfer equivalency",
        "approved_by": "Dr. Smith",
        "approved_date": "2024-01-01T00:00:00"
      }
    }
  ]
}
```

#### POST /api/courses
Create a new course.

**Request Body**:
```json
{
  "code": "BIOL 102",
  "title": "Biology II",
  "description": "Advanced biology concepts",
  "credits": 4,
  "institution": "Community College",
  "department": "Biology",
  "prerequisites": "BIOL 101"
}
```

#### PUT /api/courses/{id}
Update an existing course.

#### DELETE /api/courses/{id}
Delete a course.

### Plan Endpoints

#### GET /api/plans
Retrieve all plans with optional filtering.

**Query Parameters**:
- `student_email` (string): Filter by student email
- `program_id` (integer): Filter by program ID

**Response**:
```json
{
  "plans": [
    {
      "id": 1,
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "program_id": 1,
      "plan_name": "Fall 2024 Transfer Plan",
      "status": "active",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00",
      "courses": [...]
    }
  ]
}
```

#### GET /api/plans/{id}
Get detailed plan information with progress analysis.

**Response**:
```json
{
  "id": 1,
  "student_name": "John Doe",
  "student_email": "john@example.com",
  "program_id": 1,
  "plan_name": "Fall 2024 Transfer Plan",
  "status": "active",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "courses": [...],
  "progress": {
    "total_credits_earned": 45,
    "total_credits_required": 120,
    "completion_percentage": 37.5,
    "remaining_credits": 75,
    "category_breakdown": {...},
    "requirement_progress": [...],
    "requirements_met": 3,
    "total_requirements": 8,
    "gpa_info": {
      "gpa": 3.25,
      "total_quality_points": 146.25,
      "total_credit_hours": 45,
      "graded_courses_count": 12
    },
    "transfer_analysis": {
      "transfer_courses": [...],
      "total_transfer_credits": 30,
      "transfer_courses_count": 8
    }
  },
  "unmet_requirements": [
    {
      "category": "Core Biology",
      "credits_needed": 16,
      "description": "Advanced biology coursework required for major"
    }
  ],
  "course_suggestions": [
    {
      "category": "Core Biology",
      "credits_needed": 16,
      "description": "Advanced biology coursework required for major",
      "course_options": [
        {
          "id": 15,
          "code": "BIO 301",
          "title": "Cell Biology",
          "credits": 4,
          "institution": "State University",
          "is_preferred": true
        }
      ],
      "transfer_options": [
        {
          "dcc_course": {
            "id": 8,
            "code": "BIOL 201",
            "title": "Cell Biology",
            "credits": 4,
            "institution": "Delgado Community College"
          },
          "uno_equivalent": {
            "id": 15,
            "code": "BIO 301",
            "title": "Cell Biology",
            "credits": 4
          },
          "equivalency_type": "direct",
          "notes": "Direct transfer with lab component"
        }
      ]
    }
  ]
}
```

#### POST /api/plans
Create a new academic plan.

**Request Body**:
```json
{
  "student_name": "Jane Smith",
  "student_email": "jane@example.com",
  "program_id": 1,
  "plan_name": "Spring 2025 Transfer Plan",
  "status": "draft"
}
```

**Response**: Returns created plan object with 201 status.

#### DELETE /api/plans/{id}
Delete a plan and all associated courses.

#### POST /api/plans/{plan_id}/courses
Add a course to a plan.

**Request Body**:
```json
{
  "course_id": 5,
  "semester": "Fall",
  "year": 2024,
  "status": "planned",
  "requirement_category": "Core Biology",
  "notes": "Required for major"
}
```

#### PUT /api/plans/{plan_id}/courses/{course_id}
Update a course in a plan.

**Request Body**:
```json
{
  "semester": "Spring",
  "year": 2025,
  "status": "completed",
  "grade": "A",
  "requirement_category": "Core Biology",
  "notes": "Completed with honors"
}
```

#### DELETE /api/plans/{plan_id}/courses/{course_id}
Remove a course from a plan.

#### GET /api/plans/{plan_id}/progress
Get detailed progress analysis for a plan.

**Response**:
```json
{
  "plan_id": 1,
  "progress": {
    "total_credits_earned": 45,
    "total_credits_required": 120,
    "completion_percentage": 37.5,
    "remaining_credits": 75,
    "category_breakdown": {
      "Core Biology": {
        "courses": [
          {
            "code": "BIOL 101",
            "title": "Introduction to Biology",
            "credits": 4,
            "grade": "A"
          }
        ],
        "total_credits": 12,
        "course_count": 3
      }
    },
    "requirement_progress": [
      {
        "id": 1,
        "category": "Core Biology",
        "credits_required": 32,
        "credits_completed": 12,
        "credits_remaining": 20,
        "completion_percentage": 37.5,
        "is_complete": false,
        "description": "Required biology courses for major",
        "requirement_type": "simple"
      }
    ]
  },
  "unmet_requirements": [...],
  "suggestions": [...]
}
```

### Equivalency Endpoints

#### GET /api/equivalencies
Retrieve course equivalencies with filtering.

**Query Parameters**:
- `from_institution` (string): Filter by source institution
- `to_institution` (string): Filter by target institution

**Response**:
```json
{
  "equivalencies": [
    {
      "id": 1,
      "from_course_id": 1,
      "to_course_id": 2,
      "from_course": {
        "id": 1,
        "code": "BIOL 101",
        "title": "Introduction to Biology",
        "credits": 4,
        "institution": "Community College"
      },
      "to_course": {
        "id": 2,
        "code": "BIO 1010",
        "title": "General Biology I",
        "credits": 4,
        "institution": "State University"
      },
      "equivalency_type": "direct",
      "notes": "Direct transfer equivalency",
      "approved_by": "Dr. Smith",
      "approved_date": "2024-01-01T00:00:00",
      "created_at": "2024-01-01T00:00:00"
    }
  ]
}
```

#### POST /api/equivalencies
Create a new course equivalency.

**Request Body**:
```json
{
  "from_course_id": 1,
  "to_course_id": 2,
  "equivalency_type": "direct",
  "notes": "Direct transfer equivalency",
  "approved_by": "Dr. Smith"
}
```

#### POST /api/equivalencies/no-equivalent
Create an explicit "no equivalent" record.

**Request Body**:
```json
{
  "from_course_id": 1,
  "notes": "Course has been evaluated and does not transfer",
  "approved_by": "Dr. Smith"
}
```

#### PUT /api/equivalencies/{id}
Update an existing equivalency.

#### DELETE /api/equivalencies/{id}
Delete an equivalency.

### Program Endpoints

#### GET /api/programs
Retrieve all programs.

**Response**:
```json
{
  "programs": [
    {
      "id": 1,
      "name": "Biology Major",
      "degree_type": "BS",
      "institution": "University of New Orleans",
      "total_credits_required": 120,
      "description": "Bachelor of Science in Biology",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00",
      "requirements": [
        {
          "id": 1,
          "program_id": 1,
          "category": "Core Biology",
          "credits_required": 32,
          "description": "Required biology courses for major",
          "requirement_type": "simple",
          "is_flexible": false,
          "priority_order": 1,
          "groups": []
        },
        {
          "id": 2,
          "program_id": 1,
          "category": "Humanities",
          "credits_required": 9,
          "description": "Liberal arts breadth requirement",
          "requirement_type": "grouped",
          "is_flexible": true,
          "priority_order": 5,
          "groups": [
            {
              "id": 1,
              "requirement_id": 2,
              "group_name": "Literature & Writing",
              "courses_required": 2,
              "credits_required": 6,
              "description": "Choose 2 literature/writing courses",
              "is_required": true,
              "course_options": [
                {
                  "id": 1,
                  "group_id": 1,
                  "course_code": "ENG 201",
                  "institution": "State University",
                  "is_preferred": true,
                  "notes": "Advanced composition"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

#### GET /api/programs/{id}
Get detailed program information with requirements analysis.

**Response**: Similar to above but with additional statistics:
```json
{
  "id": 1,
  "name": "Biology Major",
  "degree_type": "BS",
  "institution": "University of New Orleans",
  "total_credits_required": 120,
  "description": "Bachelor of Science in Biology",
  "requirements": [...],
  "requirements_analysis": [
    {
      "id": 1,
      "category": "Core Biology",
      "credits_required": 32,
      "requirement_type": "simple",
      "statistics": null
    },
    {
      "id": 2,
      "category": "Humanities",
      "credits_required": 9,
      "requirement_type": "grouped",
      "statistics": {
        "total_groups": 2,
        "total_course_options": 8,
        "preferred_options": 3
      }
    }
  ]
}
```

#### GET /api/programs/{program_id}/requirements/{requirement_id}/suggestions
Get course suggestions for a specific requirement.

**Response**:
```json
{
  "requirement": {
    "id": 2,
    "category": "Humanities",
    "credits_required": 9,
    "requirement_type": "grouped"
  },
  "suggestions": [
    {
      "group": {
        "id": 1,
        "group_name": "Literature & Writing",
        "courses_required": 2,
        "credits_required": 6
      },
      "course_options": [
        {
          "course": {
            "id": 15,
            "code": "ENG 201",
            "title": "Advanced Composition",
            "credits": 3,
            "institution": "State University"
          },
          "option_info": {
            "is_preferred": true,
            "notes": "Advanced composition"
          },
          "group_name": "Literature & Writing"
        }
      ]
    }
  ]
}
```

### Upload Endpoints

#### POST /api/upload/courses
Upload course catalog data via CSV.

**Request**: Multipart form data with `file` field containing CSV.

**CSV Format**:
```csv
code,title,description,credits,institution,department,prerequisites
"BIOL 101","Introduction to Biology","Fundamental principles...",4,"Community College","Biology",""
```

**Response**:
```json
{
  "message": "Upload completed",
  "courses_created": 25,
  "courses_updated": 5,
  "errors": [
    "Row 15: Missing required code or title",
    "Row 23: Invalid data format - invalid literal for int() with base 10: 'three'"
  ]
}
```

#### POST /api/upload/equivalencies
Upload course equivalency mappings via CSV.

**CSV Format**:
```csv
from_course_code,from_institution,to_course_code,to_institution,equivalency_type,notes,approved_by
"BIOL 101","Community College","BIO 1010","State University","direct","Direct transfer","Dr. Smith"
```

**Response**:
```json
{
  "message": "Upload completed",
  "equivalencies_created": 45,
  "equivalencies_updated": 8,
  "errors": []
}
```

#### POST /api/upload/requirements
Upload program requirements and grouping rules via CSV.

**CSV Format** (Complex grouped requirements):
```csv
program_name,category,credits_required,requirement_type,group_name,courses_required,credits_required_group,course_option,institution,is_preferred,description,group_description,option_notes
"Biology Major","Humanities",9,"grouped","Literature & Writing",2,6,"ENG 201","State University","true","Liberal arts requirement","Choose 2 literature courses","Advanced composition"
"Biology Major","Humanities",9,"grouped","Literature & Writing",2,6,"ENG 205","State University","false","Liberal arts requirement","Choose 2 literature courses","Creative writing"
"Biology Major","Core Biology",32,"simple","","","","","","","Required biology courses","",""
```

**Response**:
```json
{
  "message": "Requirements upload completed",
  "requirements_created": 8,
  "groups_created": 12,
  "options_created": 45,
  "errors": []
}
```

### Health Check Endpoint

#### GET /api/health
System health check.

**Response**:
```json
{
  "status": "healthy",
  "message": "Course Transfer API is running"
}
```

### Error Responses

All endpoints return consistent error responses:

**400 Bad Request**:
```json
{
  "error": "Missing required field: student_name"
}
```

**404 Not Found**:
```json
{
  "error": "Resource not found"
}
```

**413 Payload Too Large**:
```json
{
  "error": "File too large"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error"
}
```

---

## Development Setup

### Prerequisites

**System Requirements**:
- Python 3.8+ with pip
- Node.js 16+ with npm
- Git for version control
- SQLite (development) or PostgreSQL (production)

**Recommended Tools**:
- VS Code with Python and React extensions
- Postman for API testing
- DB Browser for SQLite for database inspection

### Backend Setup

1. **Clone Repository**:
```bash
git clone <repository-url>
cd course-transfer-system
```

2. **Create Virtual Environment**:
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

3. **Install Dependencies**:
```bash
pip install flask flask-sqlalchemy flask-migrate flask-cors
```

Create `requirements.txt`:
```txt
Flask==2.3.3
Flask-SQLAlchemy==3.0.5
Flask-Migrate==4.0.5
Flask-CORS==4.0.0
```

4. **Environment Configuration**:
Create `.env` file:
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///course_transfer.db
FLASK_ENV=development
FLASK_DEBUG=True
```

5. **Initialize Database**:
```bash
python -c "from app import create_app; app = create_app(); app.app_context().push(); from models import db; db.create_all()"
```

6. **Run Development Server**:
```bash
python app.py
```

Backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to Frontend Directory**:
```bash
cd frontend
```

2. **Install Dependencies**:
```bash
npm install react react-dom vite @vitejs/plugin-react tailwindcss lucide-react
```

Create `package.json`:
```json
{
  "name": "course-transfer-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "vite": "^4.4.5"
  }
}
```

3. **Configure Vite** (`vite.config.js`):
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

4. **Configure Tailwind CSS** (`tailwind.config.js`):
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

5. **PostCSS Configuration** (`postcss.config.js`):
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

6. **Run Development Server**:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Development Workflow

**Daily Development**:
1. Start backend: `cd backend && python app.py`
2. Start frontend: `cd frontend && npm run dev`
3. Both servers will auto-reload on code changes

**API Testing**:
- Use Postman or curl to test API endpoints
- Frontend proxy configuration handles CORS in development
- Check browser network tab for API request/response debugging

**Database Management**:
- Use SQLite browser to inspect database structure
- Flask-Migrate for schema changes (if implemented)
- Manual SQL scripts for data seeding

---

## Deployment Guide

### Production Environment Setup

#### Backend Deployment (Flask)

**1. Production Configuration**:
Create `config.py` production settings:
```python
class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://user:password@localhost/course_transfer'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY')
```

**2. WSGI Server Setup** (`wsgi.py`):
```python
from app import create_app

app = create_app('production')

if __name__ == "__main__":
    app.run()
```

**3. Requirements for Production**:
```txt
Flask==2.3.3
Flask-SQLAlchemy==3.0.5
Flask-Migrate==4.0.5
Flask-CORS==4.0.0
psycopg2-binary==2.9.7  # PostgreSQL adapter
gunicorn==21.2.0        # WSGI server
```

**4. Gunicorn Configuration** (`gunicorn.conf.py`):
```python
bind = "0.0.0.0:5000"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
```

**5. Environment Variables**:
```env
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:password@localhost/course_transfer
FLASK_ENV=production
```

**6. Database Setup (PostgreSQL)**:
```sql
CREATE DATABASE course_transfer;
CREATE USER course_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE course_transfer TO course_user;
```

**7. Run Production Server**:
```bash
gunicorn --config gunicorn.conf.py wsgi:app
```

#### Frontend Deployment (React)

**1. Build for Production**:
```bash
cd frontend
npm run build
```

**2. Static File Serving**:
The build creates a `dist/` directory with optimized static files.

**3. Web Server Configuration (Nginx)**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Serve React static files
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to Flask backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Handle file uploads
    client_max_body_size 16M;
}
```

#### Docker Deployment

**Backend Dockerfile**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 5000

CMD ["gunicorn", "--config", "gunicorn.conf.py", "wsgi:app"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://course_user:password@db:5432/course_transfer
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
    volumes:
      - ./backend:/app
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
      
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=course_transfer
      - POSTGRES_USER=course_user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

**Deploy with Docker**:
```bash
docker-compose up -d
```

### Production Monitoring

**Health Checks**:
- Monitor `/api/health` endpoint
- Database connection monitoring
- File upload directory space monitoring

**Logging Configuration**:
```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/course_transfer.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
```

**Performance Monitoring**:
- Monitor API response times
- Database query performance
- File upload processing times
- Memory and CPU usage

### Backup Strategy

**Database Backups**:
```bash
# Daily backup
pg_dump course_transfer > backups/course_transfer_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump course_transfer | gzip > $BACKUP_DIR/course_transfer_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "course_transfer_*.sql.gz" -mtime +30 -delete
```

**File System Backups**:
- Regular backups of uploaded CSV files
- Application code backups
- Configuration file backups

---

## Testing Strategy

### Unit Testing

#### Backend Testing (Python unittest)

**Test Structure**:
```
tests/
├── __init__.py
├── test_models.py
├── test_routes.py
├── test_api.py
└── conftest.py
```

**Model Testing** (`test_models.py`):
```python
import unittest
from app import create_app
from models import db, Course, Plan, Equivalency

class TestCourseModel(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_course_creation(self):
        course = Course(
            code='BIOL 101',
            title='Introduction to Biology',
            credits=4,
            institution='Test College'
        )
        db.session.add(course)
        db.session.commit()
        
        self.assertEqual(course.code, 'BIOL 101')
        self.assertEqual(course.credits, 4)
    
    def test_course_validation(self):
        course = Course()  # Missing required fields
        errors = course.validate()
        
        self.assertIn("Course code is required", errors)
        self.assertIn("Course title is required", errors)
        self.assertIn("Credits must be a positive number", errors)
    
    def test_equivalency_unique_constraint(self):
        course1 = Course(code='BIOL 101', title='Bio 1', credits=4, institution='CC')
        course2 = Course(code='BIO 1010', title='Bio 1', credits=4, institution='Univ')
        db.session.add_all([course1, course2])
        db.session.commit()
        
        equiv1 = Equivalency(from_course_id=course1.id, to_course_id=course2.id)
        equiv2 = Equivalency(from_course_id=course1.id, to_course_id=course2.id)
        
        db.session.add(equiv1)
        db.session.commit()
        
        db.session.add(equiv2)
        with self.assertRaises(Exception):  # Should raise IntegrityError
            db.session.commit()
```

**API Route Testing** (`test_routes.py`):
```python
import unittest
import json
from app import create_app
from models import db, Course, Program

class TestCourseRoutes(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        
        # Create test data
        self.test_course = Course(
            code='BIOL 101',
            title='Introduction to Biology',
            credits=4,
            institution='Test College'
        )
        db.session.add(self.test_course)
        db.session.commit()
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_get_courses(self):
        response = self.client.get('/api/courses')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('courses', data)
        self.assertIn('pagination', data)
        self.assertEqual(len(data['courses']), 1)
        self.assertEqual(data['courses'][0]['code'], 'BIOL 101')
    
    def test_course_search(self):
        response = self.client.get('/api/courses?search=biology')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data['courses']), 1)
    
    def test_create_course(self):
        course_data = {
            'code': 'CHEM 101',
            'title': 'General Chemistry',
            'credits': 4,
            'institution': 'Test College'
        }
        
        response = self.client.post(
            '/api/courses',
            data=json.dumps(course_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        
        # Verify course was created
        course = Course.query.filter_by(code='CHEM 101').first()
        self.assertIsNotNone(course)
        self.assertEqual(course.title, 'General Chemistry')
    
    def test_create_course_validation(self):
        invalid_course_data = {
            'code': '',  # Invalid: empty code
            'title': 'Test Course',
            'credits': -1,  # Invalid: negative credits
            'institution': 'Test College'
        }
        
        response = self.client.post(
            '/api/courses',
            data=json.dumps(invalid_course_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('errors', data)
```

**Progress Calculation Testing**:
```python
class TestPlanProgress(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        
        # Create test program with requirements
        self.program = Program(
            name='Test Biology Major',
            degree_type='BS',
            institution='Test University',
            total_credits_required=120
        )
        
        self.requirement = ProgramRequirement(
            program=self.program,
            category='Core Biology',
            credits_required=32,
            requirement_type='simple'
        )
        
        db.session.add_all([self.program, self.requirement])
        db.session.commit()
        
        # Create test plan
        self.plan = Plan(
            student_name='Test Student',
            program_id=self.program.id,
            plan_name='Test Plan'
        )
        db.session.add(self.plan)
        db.session.commit()
    
    def test_progress_calculation_empty_plan(self):
        progress = self.plan.calculate_progress()
        
        self.assertEqual(progress['total_credits_earned'], 0)
        self.assertEqual(progress['total_credits_required'], 120)
        self.assertEqual(progress['completion_percentage'], 0)
        self.assertEqual(progress['remaining_credits'], 120)
    
    def test# Course Transfer System - Technical Documentation

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Development Setup](#development-setup)
7. [Deployment Guide](#deployment-guide)
8. [Testing Strategy](#testing-strategy)
9. [Security Considerations](#security-considerations)
10. [Performance Optimization](#performance-optimization)
11. [Troubleshooting](#troubleshooting)

---

## System Architecture

### Overview
The Course Transfer System is a full-stack web application built with a Flask REST API backend and React frontend. The system manages course catalogs, transfer equivalencies, academic programs, and student transfer plans.

### Technology Stack

**Backend**:
- **Framework**: Flask 2.x with Flask-SQLAlchemy ORM
- **Database**: SQLite (development), PostgreSQL (production recommended)
- **API Design**: RESTful architecture with JSON responses
- **File Handling**: CSV upload processing with pandas/csv
- **CORS**: Flask-CORS for cross-origin requests
- **Migration**: Flask-Migrate for database schema management

**Frontend**:
- **Framework**: React 18+ with functional components and hooks
- **Build Tool**: Vite for development and bundling
- **Styling**: Tailwind CSS utility-first framework
- **Icons**: Lucide React icon library
- **HTTP Client**: Native fetch API with custom service layer
- **State Management**: React useState/useEffect hooks

**Development Tools**:
- **Package Management**: npm/yarn (frontend), pip (backend)
- **Code Organization**: Modular component architecture
- **Environment**: Separate development and production configurations

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │────│   Flask API     │────│   SQLite/PostgreSQL
│   (Port 5173)   │    │   (Port 5000)   │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Data Flow**:
1. User interactions in React components
2. API calls through service layer
3. Flask route handlers process requests
4. SQLAlchemy ORM interacts with database
5. JSON responses back to frontend
6. State updates trigger UI re-renders

---

## Backend Implementation

### Project Structure

```
backend/
├── app.py                 # Flask application factory
├── config.py             # Configuration classes
├── models/               # SQLAlchemy model definitions
│   ├── __init__.py       # Database initialization
│   ├── course.py         # Course model
│   ├── program.py        # Program and requirement models
│   ├── plan.py           # Student plan models
│   └── equivalency.py    # Course equivalency model
└── routes/               # API route handlers
    ├── __init__.py       # Route registration
    ├── courses.py        # Course management endpoints
    ├── programs.py       # Program management endpoints
    ├── plans.py          # Student plan endpoints
    ├── equivalencies.py  # Equivalency management endpoints
    └── upload.py         # CSV upload endpoints
```

### Flask Application Configuration

**app.py** - Application Factory Pattern:
```python
def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///course_transfer.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB file upload limit
    
    # Initialize extensions
    CORS(app)  # Enable cross-origin requests
    db = init_app(app)  # Initialize SQLAlchemy
    register_routes(app)  # Register API blueprints
    
    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    # Database creation
    with app.app_context():
        db.create_all()
    
    return app
```

**Configuration Classes** (config.py):
- `Config`: Base configuration with common settings
- `DevelopmentConfig`: Debug mode, SQLite database
- `ProductionConfig`: Production optimizations, PostgreSQL
- `TestingConfig`: In-memory database for testing

### Database Models

#### Core Model Relationships

```python
# Core entity relationships
Course 1---* Equivalency *---1 Course (from/to relationship)
Program 1---* ProgramRequirement 1---* RequirementGroup 1---* GroupCourseOption
Program 1---* Plan 1---* PlanCourse *---1 Course
ProgramRequirement 1---* RequirementGroup
```

#### Course Model (models/course.py)

```python
class Course(db.Model):
    __tablename__ = 'courses'
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), nullable=False, index=True)  # e.g., "BIOL 101"
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    credits = db.Column(db.Integer, nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100))
    prerequisites = db.Column(db.Text)  # Comma-separated course codes
    
    # Audit fields
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    equivalent_from = db.relationship('Equivalency', foreign_keys='Equivalency.from_course_id', backref='from_course')
    equivalent_to = db.relationship('Equivalency', foreign_keys='Equivalency.to_course_id', backref='to_course')
    
    def validate(self):
        """Validation logic for course data"""
        errors = []
        if not self.code or len(self.code.strip()) == 0:
            errors.append("Course code is required")
        if not self.title or len(self.title.strip()) == 0:
            errors.append("Course title is required")
        if not self.credits or self.credits <= -1:
            errors.append("Credits must be a positive number")
        if not self.institution or len(self.institution.strip()) == 0:
            errors.append("Institution is required")
        return errors
```

#### Program and Requirements Models (models/program.py)

**Program Model**:
```python
class Program(db.Model):
    __tablename__ = 'programs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)  # e.g., "Biology Major"
    degree_type = db.Column(db.String(50), nullable=False)  # BS, BA, AS, etc.
    institution = db.Column(db.String(100), nullable=False)
    total_credits_required = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    
    # Relationships
    requirements = db.relationship('ProgramRequirement', backref='program', cascade='all, delete-orphan')
    plans = db.relationship('Plan', backref='program')
```

**ProgramRequirement Model** - Supports three types:
1. **Simple**: Basic credit requirement (e.g., "32 credits of Core Biology")
2. **Grouped**: Choose X from Y options (e.g., "Choose 2 from Literature Group")
3. **Conditional**: Complex logic-based requirements

```python
class ProgramRequirement(db.Model):
    __tablename__ = 'program_requirements'
    
    id = db.Column(db.Integer, primary_key=True)
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    category = db.Column(db.String(100), nullable=False)  # e.g., "Humanities", "Core Biology"
    credits_required = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    requirement_type = db.Column(db.String(50), default='simple')  # simple, grouped, conditional
    is_flexible = db.Column(db.Boolean, default=False)
    priority_order = db.Column(db.Integer, default=0)
    
    # Relationships for grouped requirements
    groups = db.relationship('RequirementGroup', backref='requirement', cascade='all, delete-orphan')
    
    def evaluate_completion(self, student_courses):
        """Evaluate if requirement is satisfied by student's courses"""
        if self.requirement_type == 'simple':
            return self._evaluate_simple_requirement(student_courses)
        elif self.requirement_type == 'grouped':
            return self._evaluate_grouped_requirement(student_courses)
        # ... implementation details
```

**RequirementGroup Model** - For complex grouped requirements:
```python
class RequirementGroup(db.Model):
    __tablename__ = 'requirement_groups'
    
    id = db.Column(db.Integer, primary_key=True)
    requirement_id = db.Column(db.Integer, db.ForeignKey('program_requirements.id'), nullable=False)
    group_name = db.Column(db.String(100), nullable=False)  # e.g., "Literature & Writing"
    courses_required = db.Column(db.Integer, nullable=False)  # Number of courses needed
    credits_required = db.Column(db.Integer)  # Alternative: credit-based requirement
    min_credits_per_course = db.Column(db.Integer, default=0)
    max_credits_per_course = db.Column(db.Integer)
    description = db.Column(db.Text)
    is_required = db.Column(db.Boolean, default=True)
    
    # Course options for this group
    course_options = db.relationship('GroupCourseOption', backref='group', cascade='all, delete-orphan')
```

#### Plan Models (models/plan.py)

**Plan Model** - Student academic plans:
```python
class Plan(db.Model):
    __tablename__ = 'plans'
    
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(200), nullable=False)
    student_email = db.Column(db.String(200))
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    plan_name = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='draft')  # draft, active, completed
    created_at = db.Column(db.DateTime, server_default=func.now())
    updated_at = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    courses = db.relationship('PlanCourse', backref='plan', cascade='all, delete-orphan')
    
    def calculate_progress(self):
        """Complex progress calculation algorithm"""
        # Defensive programming against missing data
        program = getattr(self, 'program', None)
        requirements = getattr(program, 'requirements', []) if program else []
        required_credits = getattr(program, 'total_credits_required', 0) or 0

        # Calculate completed credits
        total_credits = sum(
            (course.credits or (course.course.credits if course.course else 0) or 0)
            for course in self.courses
            if course.status == 'completed'
        )

        # Analyze courses by status
        completed_courses = [course for course in self.courses if course.status == 'completed']
        planned_courses = [course for course in self.courses if course.status == 'planned']
        in_progress_courses = [course for course in self.courses if course.status == 'in_progress']

        # Category breakdown analysis
        category_breakdown = {}
        for course in completed_courses:
            category = course.requirement_category or 'Uncategorized'
            if category not in category_breakdown:
                category_breakdown[category] = {
                    'courses': [],
                    'total_credits': 0,
                    'course_count': 0
                }
            # ... detailed breakdown logic
        
        # Return comprehensive progress data
        return {
            'total_credits_earned': total_credits,
            'total_credits_required': required_credits,
            'completion_percentage': completion_percentage,
            'remaining_credits': max(0, required_credits - total_credits),
            'category_breakdown': category_breakdown,
            'requirement_progress': requirement_progress,
            # ... additional metrics
        }
```

**PlanCourse Model** - Junction table with additional plan-specific data:
```python
class PlanCourse(db.Model):
    __tablename__ = 'plan_courses'
    
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    
    # Scheduling information
    semester = db.Column(db.String(50))  # Fall, Spring, Summer
    year = db.Column(db.Integer)
    
    # Academic information
    status = db.Column(db.String(50), default='planned')  # planned, in_progress, completed
    grade = db.Column(db.String(10))  # A, B+, C, etc.
    credits = db.Column(db.Integer)  # Override course credits if needed
    requirement_category = db.Column(db.String(100))  # Which requirement this fulfills
    notes = db.Column(db.Text)
    
    # Relationships
    course = db.relationship('Course', backref='plan_courses')
```

#### Equivalency Model (models/equivalency.py)

```python
class Equivalency(db.Model):
    __tablename__ = 'equivalencies'
    
    id = db.Column(db.Integer, primary_key=True)
    from_course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    to_course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    equivalency_type = db.Column(db.String(50), default='direct')  # direct, partial, conditional, no_equiv
    notes = db.Column(db.Text)
    approved_by = db.Column(db.String(100))  # Who approved this equivalency
    approved_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint to prevent duplicate mappings
    __table_args__ = (db.UniqueConstraint('from_course_id', 'to_course_id', name='unique_equivalency'),)
```

### API Route Implementation

#### Course Routes (routes/courses.py)

**Course Search with Advanced Filtering**:
```python
@bp.route('', methods=['GET'])
def get_courses():
    # Extract query parameters
    search = request.args.get('search', '')
    institution = request.args.get('institution', '')
    department = request.args.get('department', '')
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)  # Limit page size
    
    # Build query with filters
    query = Course.query
    
    if search:
        query = query.filter(
            or_(
                Course.code.ilike(f'%{search}%'),
                Course.title.ilike(f'%{search}%'),
                Course.description.ilike(f'%{search}%')
            )
        )
    
    if institution:
        query = query.filter(Course.institution.ilike(f'%{institution}%'))
    
    if department:
        query = query.filter(Course.department.ilike(f'%{department}%'))
    
    # Implement pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    courses = pagination.items
    
    return jsonify({
        'courses': [course.to_dict() for course in courses],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    })
```

**Course Details with Equivalency Information**:
```python
@bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course = Course.query.get_or_404(course_id)
    
    # Get all equivalency records for this course
    all_equivalencies = Equivalency.query.filter_by(from_course_id=course_id).all()
    
    if not all_equivalencies:
        return jsonify({
            'course': course.to_dict(),
            'equivalency_status': 'not_evaluated',
            'message': 'No equivalency information available for this course',
            'equivalencies': []
        })
    
    # Categorize equivalencies
    no_equiv_records = []
    transfer_equivalencies = []
    
    for equiv in all_equivalencies:
        if equiv.to_course and equiv.to_course.code == '1000NE':  # Special "no equivalent" marker
            no_equiv_records.append({
                'type': 'no_equivalent',
                'equivalency': equiv.to_dict(),
                'message': 'This course does not transfer'
            })
        elif equiv.to_course:
            transfer_equivalencies.append({
                'type': 'equivalent_to',
                'course': equiv.to_course.to_dict(),
                'equivalency': equiv.to_dict()
            })
    
    # Determine overall status
    if no_equiv_records and not transfer_equivalencies:
        status = 'no_transfer'
        message = 'Course has been evaluated and does not transfer'
    elif transfer_equivalencies:
        status = 'has_equivalents'
        message = f'Course has {len(transfer_equivalencies)} equivalent(s)'
    else:
        status = 'unknown'
        message = 'Equivalency records exist but are unclear'
    
    return jsonify({
        'course': course.to_dict(),
        'equivalency_status': status,
        'message': message,
        'equivalencies': transfer_equivalencies + no_equiv_records
    })
```

#### Plan Routes (routes/plans.py)

**Plan Creation with Validation**:
```python
@bp.route('', methods=['POST'])
def create_plan():
    data = request.get_json()
    
    # Validate required fields
    if not data.get('student_name'):
        return jsonify({'error': 'Student name is required'}), 400
    if not data.get('plan_name'):
        return jsonify({'error': 'Plan name is required'}), 400
    
    # Verify program exists
    program = Program.query.get(data.get('program_id'))
    if not program:
        return jsonify({'error': 'Program not found'}), 404
    
    plan = Plan(
        student_name=data.get('student_name'),
        student_email=data.get('student_email'),
        program_id=data.get('program_id'),
        plan_name=data.get('plan_name'),
        status=data.get('status', 'draft')
    )
    
    try:
        db.session.add(plan)
        db.session.commit()
        return jsonify(plan.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create plan'}), 500
```

**Advanced Plan Details with Progress Calculation**:
```python
@bp.route('/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    plan = Plan.query.get_or_404(plan_id)
    
    # Serialize base plan data
    plan_data = plan.to_dict()
    
    # Add computed fields
    plan_data['progress'] = plan.calculate_progress()
    plan_data['unmet_requirements'] = plan.get_unmet_requirements()
    plan_data['course_suggestions'] = plan.suggest_courses_for_requirements()
    
    return jsonify(plan_data)
```

#### CSV Upload Routes (routes/upload.py)

**Course Upload with Error Handling**:
```python
@bp.route('/courses', methods=['POST'])
def upload_courses():
    # File validation
    if 'file' not in request.files:
        return jsonify({'error': 'File not Given'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'file not selected'}), 400
    
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        # Parse CSV with error tracking
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        courses_created = 0
        courses_updated = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Extract and validate data
                code = row.get('code', '').strip()
                title = row.get('title', '').strip()
                
                if not code or not title:
                    errors.append(f"Row {row_num}: Missing required code or title")
                    continue
                
                # Check for existing course
                existing_course = Course.query.filter_by(
                    code=code,
                    institution=row.get('institution', '').strip()
                ).first()
                
                if existing_course:
                    # Update existing course
                    existing_course.title = title
                    existing_course.description = row.get('description', '').strip()
                    existing_course.credits = int(row.get('credits', 0))
                    existing_course.department = row.get('department', '').strip()
                    existing_course.prerequisites = row.get('prerequisites', '').strip()
                    courses_updated += 1
                else:
                    # Create new course
                    course = Course(
                        code=code,
                        title=title,
                        description=row.get('description', '').strip(),
                        credits=int(row.get('credits', 0)),
                        institution=row.get('institution', '').strip(),
                        department=row.get('department', '').strip(),
                        prerequisites=row.get('prerequisites', '').strip()
                    )
                    
                    # Validate course data
                    validation_errors = course.validate()
                    if validation_errors:
                        errors.append(f"Row {row_num}: {', '.join(validation_errors)}")
                        continue
                    
                    db.session.add(course)
                    courses_created += 1
                    
            except ValueError as e:
                errors.append(f"Row {row_num}: Invalid data format - {str(e)}")
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        # Commit changes if any successful operations
        if courses_created > 0 or courses_updated > 0:
            db.session.commit()
        
        return jsonify({
            'message': 'Upload completed',
            'courses_created': courses_created,
            'courses_updated': courses_updated,
            'errors': errors
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500
```

---

## Frontend Implementation

### Project Structure

```
frontend/src/
├── main.jsx              # Application entry point
├── App.jsx               # Main application component
├── index.css             # Tailwind CSS imports
├── components/           # React components
│   ├── CourseSearch.jsx  # Course search and discovery
│   ├── PlanBuilder.jsx   # Academic plan management
│   ├── ProgressTracker.jsx # Degree progress tracking
│   ├── CSVUpload.jsx     # Bulk data upload
│   ├── CreatePlanModal.jsx # Plan creation modal
│   └── AddCourseToPlanModal.jsx # Course addition modal
└── services/
    └── api.js            # API service layer
```

### Application Architecture

**App.jsx** - Main application controller:
```jsx
const App = () => {
  // Global state management
  const [activeTab, setActiveTab] = useState('search');
  const [userMode, setUserMode] = useState('student');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [planRefreshTrigger, setPlanRefreshTrigger] = useState(0);
  
  // Modal state for course addition
  const [addCourseModal, setAddCourseModal] = useState({
    isOpen: false,
    courses: [],
    plan: null,
    program: null
  });

  // Navigation tabs configuration
  const tabs = [
    { id: 'search', label: 'Course Search', icon: Search },
    { id: 'plans', label: 'Academic Plans', icon: FileText },
    ...(userMode === 'advisor' ?
    [{ id: 'upload', label: 'CSV Upload', icon: Upload }] : []),
  ];

  // Load initial data
  React.useEffect(() => {
    loadPlansAndPrograms();
  }, []);

  // Unified handler for adding courses to plan
  const handleAddToPlan = async (courses) => {
    if (!selectedPlanId) {
      alert('Please select a plan first.');
      return;
    }

    try {
      // Refresh the selected plan before opening the modal
      const refreshedPlan = await api.getPlan(selectedPlanId);
      
      // Get matching program based on refreshed plan's program_id
      const refreshedProgram = programs.find(p => p.id === refreshedPlan.program_id) 
        || await api.getProgram(refreshedPlan.program_id);

      // Ensure courses is an array
      const coursesArray = Array.isArray(courses) ? courses : [courses];

      setAddCourseModal({
        isOpen: true,
        courses: coursesArray,
        plan: refreshedPlan,
        program: refreshedProgram
      });

    } catch (error) {
      console.error('Failed to load latest plan or program:', error);
      alert('Could not load plan data. Please try again.');
    }
  };

  // ... rest of component implementation
};
```

### API Service Layer (services/api.js)

**Centralized HTTP Client**:
```javascript
class ApiService {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }
  
  // Course management methods
  async searchCourses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/courses${queryString ? `?${queryString}` : ''}`);
  }

  async getCourse(id) {
    return this.request(`/courses/${id}`);
  }

  // Plan management methods
  async getPlans(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/plans${queryString ? `?${queryString}` : ''}`);
  }

  async getPlan(id) {
    return this.request(`/plans/${id}`);
  }

  async createPlan(data) {
    return this.request('/plans', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async addCourseToPlan(planId, data) {
    return this.request(`/plans/${planId}/courses`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // File upload methods
  async uploadCourses(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/upload/courses', {
      method: 'POST',
      headers: {}, // Let browser set multipart headers
      body: formData
    });
  }

  // ... additional methods
}

const api = new ApiService();
export default api;
```

### Component Implementations

#### CourseSearch Component

**Key Features**:
- Advanced search with multiple filters
- Real-time requirement category detection
- Multi-select functionality
- Equivalency information display
- Integration with plan management

**State Management**:
```jsx
const CourseSearch = ({ 
  onCourseSelect = null, 
  onMultiSelect = null, 
  planId = '', 
  setPlanId = null,
  onAddToPlan = null,
  program = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [institution, setInstitution] = useState('');
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [detectedCategories, setDetectedCategories] = useState(new Map());
  const [plans, setPlans] = useState([]);
```

**Intelligent Category Detection**:
```jsx
// Detect categories for each course based on program requirements
if (program && program.requirements && searchResults.length > 0) {
  const categoryMap = new Map();
  
  searchResults.forEach(course => {
    let detectedCategory = 'Elective';
    
    // Check if course matches any requirement group
    const match = program.requirements.find(req => {
      if (req.groups) {
        return req.groups.some(g => 
          g.course_options && 
          g.course_options.some(opt => opt.course_code === course.code)
        );
      }
      return false;
    });
    
    if (match) {
      detectedCategory = match.category;
    } else {
      // Try to match by department/subject code
      const courseSubject = course.code.match(/^[A-Z]+/)?.[0];
      if (courseSubject) {
        const deptMatch = program.requirements.find(req => {
          const reqName = req.category.toLowerCase();
          return (
            (courseSubject === 'BIOL' && reqName.includes('bio')) ||
            (courseSubject === 'CHEM' && reqName.includes('chem')) ||
            (courseSubject === 'MATH' && reqName.includes('math')) ||
            (courseSubject === 'PHYS' && reqName.includes('phys')) ||
            (courseSubject === 'ENG' && (reqName.includes('english') || reqName.includes('composition'))) ||
            // ... additional subject mappings
          );
        });
        if (deptMatch) detectedCategory = deptMatch.category;
      }
    }
    
    categoryMap.set(course.id, detectedCategory);
  });
  
  setDetectedCategories(categoryMap);
}
```

**Multi-Course Selection Logic**:
```jsx
const toggleCourseSelection = (course) => {
  const isSelected = selectedCourses.some((c) => c.id === course.id);
  if (isSelected) {
    setSelectedCourses(selectedCourses.filter((c) => c.id !== course.id));
  } else {
    // Add course with detected category
    const courseWithCategory = {
      ...course,
      detectedCategory: detectedCategories.get(course.id) || 'Elective'
    };
    setSelectedCourses([...selectedCourses, courseWithCategory]);
  }
};

const handleAddSelected = () => {
  if (onMultiSelect && selectedCourses.length > 0) {
    onMultiSelect(selectedCourses);
    setSelectedCourses([]);
  }
};
```

#### AddCourseToPlanModal Component

**Complex Course Assignment Logic**:
```jsx
const AddCourseToPlanModal = ({ 
  isOpen, 
  onClose, 
  courses = [], 
  plan,
  program,
  onCoursesAdded 
}) => {
  // Initialize form data for each course with smart defaults
  const initializeCourseData = () => {
    return courses.map(course => {
      let suggestedCategory = course.detectedCategory || 'Free Electives';
      let suggestedGroup = null;

      if (program && program.requirements) {
        // Find matching category by group membership
        const match = program.requirements.find(req => {
          if (req.groups) {
            const groupMatch = req.groups.find(g =>
              g.course_options?.some(opt => opt.course_code === course.code)
            );
            if (groupMatch) {
              suggestedGroup = groupMatch;
              suggestedCategory = req.category;
              return true;
            }
          }
          return false;
        });
      }

      return {
        course,
        requirement_category: suggestedCategory,
        requirement_group_id: suggestedGroup?.id || null,
        semester: 'Fall',
        year: new Date().getFullYear(),
        status: 'planned',
        grade: '',
        notes: ''
      };
    });
  };

  // State management for bulk operations
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [planCourses, setPlanCourses] = useState([]);
  const [requirementStatus, setRequirementStatus] = useState({});
  
  // Global settings for bulk operations
  const [applyToAll, setApplyToAll] = useState({
    semester: false,
    year: false,
    status: false,
    requirement_category: false
  });
```

**Requirement Status Calculation**:
```jsx
const calculateRequirementStatus = (currentCourses) => {
  if (!program || !program.requirements) return;

  const status = {};
  
  program.requirements.forEach(req => {
    const categoryStatus = {
      category: req.category,
      type: req.requirement_type,
      totalRequired: req.credits_required,
      totalCompleted: 0,
      groups: {}
    };

    // Get courses in this requirement category
    const categoryCourses = currentCourses.filter(c => 
      c.requirement_category === req.category
    );

    // Calculate total credits completed
    categoryStatus.totalCompleted = categoryCourses.reduce((sum, c) => 
      sum + (c.credits || c.course.credits || 0), 0
    );

    // Handle grouped requirements
    if (req.requirement_type === 'grouped' && req.groups) {
      req.groups.forEach(group => {
        // Find courses that match this specific group
        const groupCourses = categoryCourses.filter(planCourse => {
          return group.course_options?.some(opt => 
            opt.course_code === planCourse.course.code
          );
        });

        categoryStatus.groups[group.id] = {
          name: group.group_name,
          coursesRequired: group.courses_required,
          coursesCompleted: groupCourses.length,
          creditsRequired: group.credits_required,
          creditsCompleted: groupCourses.reduce((sum, c) => 
            sum + (c.credits || c.course.credits || 0), 0
          ),
          isFull: false
        };

        // Check if group is full
        if (group.courses_required) {
          categoryStatus.groups[group.id].isFull = 
            groupCourses.length >= group.courses_required;
        } else if (group.credits_required) {
          categoryStatus.groups[group.id].isFull = 
            categoryStatus.groups[group.id].creditsCompleted >= group.credits_required;
        }
      });
    }

    status[req.category] = categoryStatus;
  });

  setRequirementStatus(status);
};
```

**Course Assignment Validation**:
```jsx
const validateCourseAssignment = (courseIndex) => {
  const data = courseData[courseIndex];
  const requirement = program?.requirements?.find(req => 
    req.category === data.requirement_category
  );

  if (!requirement) return { valid: true };

  const categoryStatus = requirementStatus[data.requirement_category];
  if (!categoryStatus) return { valid: true };

  // Check if category is already full
  if (categoryStatus.totalCompleted >= categoryStatus.totalRequired) {
    return {
      valid: false,
      error: `${data.requirement_category} requirement already has ${categoryStatus.totalCompleted} of ${categoryStatus.totalRequired} required credits`
    };
  }

  // For grouped requirements, check specific group constraints
  if (requirement.requirement_type === 'grouped' && data.requirement_group_id) {
    const groupStatus = categoryStatus.groups[data.requirement_group_id];
    if (groupStatus && groupStatus.isFull) {
      return {
        valid: false,
        error: `${groupStatus.name} group already has the required ${
          groupStatus.coursesRequired ? 
          `${groupStatus.coursesRequired} course(s)` : 
          `${groupStatus.creditsRequired} credits`
        }`
      };
    }
  }

  return { valid: true };
};
```

**Bulk Operation Handling**:
```jsx
const updateCourseField = (index, field, value) => {
  const updated = [...courseData];
  updated[index][field] = value;
  
  // If changing requirement category, reset group selection
  if (field === 'requirement_category') {
    updated[index].requirement_group_id = null;
    
    // Auto-select group if only one available
    const availableGroups = getAvailableGroups(index);
    if (availableGroups.length === 1) {
      updated[index].requirement_group_id = availableGroups[0].id;
    }
  }
  
  // If "apply to all" is checked for this field, update all courses
  if (applyToAll[field]) {
    updated.forEach((data, i) => {
      if (i !== index) {
        data[field] = value;
        if (field === 'requirement_category') {
          data.requirement_group_id = null;
        }
      }
    });
  }
  
  setCourseData(updated);
};

const toggleApplyToAll = (field) => {
  const newApplyToAll = { ...applyToAll, [field]: !applyToAll[field] };
  setApplyToAll(newApplyToAll);
  
  // If turning on, apply the first course's value to all
  if (!applyToAll[field] && courseData.length > 0) {
    const value = courseData[0][field];
    const updated = courseData.map(data => ({ ...data, [field]: value }));
    setCourseData(updated);
  }
};
```

#### ProgressTracker Component

**Comprehensive Progress Analysis**:
```jsx
const ProgressTracker = ({ plan }) => {
  if (!plan || !plan.progress) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="mr-2" size={20} />
          Degree Progress
        </h3>
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>Progress information not available</p>
        </div>
      </div>
    );
  }

  const progress = plan.progress;
  const unmetRequirements = plan.unmet_requirements || [];
  const completionPercentage = Math.min(progress.completion_percentage || 0, 100);
  const isCompleted = completionPercentage >= 100;
```

**Course Grouping and Analysis**:
```jsx
const groupCoursesByRequirement = (courses) => {
  const grouped = {};
  courses.forEach(course => {
    const category = course.requirement_category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(course);
  });
  return grouped;
};

const getRequirementProgress = (category) => {
  const courses = coursesByRequirement[category] || [];
  const completedCourses = courses.filter(c => c.status === 'completed');
  const inProgressCourses = courses.filter(c => c.status === 'in_progress');
  const plannedCourses = courses.filter(c => c.status === 'planned');
  
  const completedCredits = completedCourses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0);
  const inProgressCredits = inProgressCourses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0);
  const plannedCredits = plannedCourses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0);
  
  return {
    completed: completedCredits,
    inProgress: inProgressCredits,
    planned: plannedCredits,
    total: completedCredits + inProgressCredits + plannedCredits,
    courses: courses
  };
};
```

**Dynamic Progress Visualization**:
```jsx
const getProgressColor = (percentage) => {
  if (percentage >= 100) return 'from-green-500 to-emerald-500';
  if (percentage >= 75) return 'from-blue-500 to-green-500';
  if (percentage >= 50) return 'from-yellow-500 to-blue-500';
  if (percentage >= 25) return 'from-orange-500 to-yellow-500';
  return 'from-red-500 to-orange-500';
};

const getProgressMessage = (percentage) => {
  if (percentage >= 100) return 'Congratulations! All requirements completed!';
  if (percentage >= 75) return 'You\'re almost there! Keep up the great work!';
  if (percentage >= 50) return 'Great progress! You\'re halfway there!';
  if (percentage >= 25) return 'Good start! Continue building your plan!';
  return 'This is the beginning of an incredible journey!';
};
```

#### CSVUpload Component

**Multi-Type Upload Handling**:
```jsx
const CSVUpload = () => {
  const [uploadType, setUploadType] = useState('courses');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // File validation
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadResult({ 
        error: 'Please upload a CSV file (.csv extension required)' 
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadResult({ 
        error: 'File size too large. Please upload files smaller than 10MB.' 
      });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      let result;
      switch (uploadType) {
        case 'courses':
          result = await api.uploadCourses(file);
          break;
        case 'equivalencies':
          result = await api.uploadEquivalencies(file);
          break;
        case 'requirements':
          result = await api.uploadRequirements(file);
          break;
        default:
          throw new Error('Invalid upload type');
      }
      
      setUploadResult(result);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResult({ error: error.message });
    } finally {
      setUploading(false);
    }
  };
```

**Drag and Drop Implementation**:
```jsx
const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);
  
  const file = e.dataTransfer.files[0];
  if (file) {
    handleFileUpload(file);
  }
};

const handleDrag = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.type === 'dragenter' || e.type === 'dragover') {
    setDragActive(true);
  } else if (e.type === 'dragleave') {
    setDragActive(false);
  }
};
```

**Sample CSV Generation**:
```jsx
const downloadSampleCSV = (type) => {
  let csvContent, filename;
  
  if (type === 'courses') {
    csvContent = `code,title,description,credits,institution,department,prerequisites
"BIOL 101","Introduction to Biology","Fundamental principles of biology including cell structure, genetics, and evolution.",4,"Community College","Biology",""
"MATH 151","Calculus I","Limits, derivatives, and applications of differential calculus.",4,"Community College","Mathematics","MATH 141"
// ... additional sample data
`;
    filename = 'sample_courses.csv';
  } else if (type === 'equivalencies') {
    csvContent = `from_course_code,from_institution,to_course_code,to_institution,equivalency_type,notes,approved_by
"BIOL 101","Community College","BIO 1010","State University","direct","Direct transfer equivalency","Dr. Smith"
// ... additional sample data
`;
    filename = 'sample_equivalencies.csv';
  } else if (type === 'requirements') {
    csvContent = `program_name,category,credits_required,requirement_type,group_name,courses_required,credits_required_group,course_option,institution,is_preferred,description,group_description,option_notes
"Biology Major","Humanities",9,"grouped","Literature & Writing",2,6,"ENG 201","State University","true","Liberal arts breadth requirement","Choose 2 literature/writing courses","Advanced composition"
// ... additional sample data
`;
    filename = 'sample_program_requirements.csv';
  }

  // Create and download blob
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     courses     │       │  equivalencies  │       │     courses     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ from_course_id  │       │ id (PK)         │
│ code            │       │ to_course_id    ├──────►│ code            │
│ title           │       │ equivalency_type│       │ title           │
│ description     │       │ notes           │       │ description     │
│ credits         │       │ approved_by     │       │ credits         │
│ institution     │       │ approved_date   │       │ institution     │
│ department      │       │ created_at      │       │ department      │
│ prerequisites   │       └─────────────────┘       │ prerequisites   │
│ created_at      │                                 │ created_at      │
│ updated_at      │                                 │ updated_at      │
└─────────────────┘                                 └─────────────────┘
                                                    
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    programs     │       │     plans       │       │   plan_courses  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ program_id      │       │ id (PK)         │
│ name            │       │ id (PK)         │◄──────┤ plan_id         │
│ degree_type     │       │ student_name    │       │ course_id       ├──┐
│ institution     │       │ student_email   │       │ semester        │  │
│ total_credits_  │       │ plan_name       │       │ year            │  │
│   required      │       │ status          │       │ status          │  │
│ description     │       │ created_at      │       │ grade           │  │
│ created_at      │       │ updated_at      │       │ credits         │  │
│ updated_at      │       └─────────────────┘       │ requirement_    │  │
└─────────────────┘                                 │   category      │  │
         │                                          │ notes           │  │
         │                                          └─────────────────┘  │
         ▼                                                               │
┌─────────────────┐                                                     │
│program_require- │                                                     │
│     ments       │                                                     │
├─────────────────┤                                                     │
│ id (PK)         │                                                     │
│ program_id      │                                                     │
│ category        │                                                     │
│ credits_required│                                                     │
│ description     │                                                     │
│ requirement_type│                                                     │
│ is_flexible     │                                                     │
│ priority_order  │                                                     │
└─────────────────┘                                                     │
         │                                                              │
         ▼                                                              │
┌─────────────────┐                                                     │
│requirement_     │                                                     │
│     groups      │                                                     │
├─────────────────┤                                                     │
│ id (PK)         │                                                     │
│ requirement_id  │                                                     │
│ group_name      │                                                     │
│ courses_required│                                                     │
│ credits_required│                                                     │
│ min_credits_per_│                                                     │
│   course        │                                                     │
│ max_credits_per_│                                                     │
│   course        │                                                     │
│ description     │                                                     │
│ is_required     │                                                     │
└─────────────────┘                                                     │
         │                                                              │
         ▼                                                              │
┌─────────────────┐                                          ┌─────────▼───────┐
│group_course_    │                                          │     courses     │
│    options      │                                          ├─────────────────┤
├─────────────────┤                                          │ id (PK)         │
│ id (PK)         │                                          │ code            │
│ group_id        │                                          │ title           │
│ course_code     │──────────────────────────────────────────│ description     │
│ institution     │                                          │ credits         │
│ is_preferred    │                                          │ institution     │
│ notes           │                                          │ department      │
└─────────────────┘                                          │ prerequisites   │
                                                             │ created_at      │
                                                             │ updated_at      │
                                                             └─────────────────┘
```

### Table Specifications

#### courses
```sql
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    institution VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    prerequisites TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_institution ON courses(institution);
CREATE INDEX idx_courses_department ON courses(department);
```

#### equivalencies
```sql
CREATE TABLE equivalencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_course_id INTEGER NOT NULL,
    to_course_id INTEGER NOT NULL,
    equivalency_type VARCHAR(50) DEFAULT 'direct',
    notes TEXT,
    approved_by VARCHAR(100),
    approved_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_course_id) REFERENCES courses(id),
    FOREIGN KEY (to_course_id) REFERENCES courses(id),
    UNIQUE(from_course_id, to_course_id)
);

CREATE INDEX idx_equivalencies_from_course ON equivalencies(from_course_id);
CREATE INDEX idx_equivalencies_to_course ON equivalencies(to_course_id);
```

#### programs
```sql
CREATE TABLE programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    degree_type VARCHAR(50) NOT NULL,
    institution VARCHAR(100) NOT NULL,
    total_credits_required INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### program_requirements
```sql
CREATE TABLE program_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    credits_required INTEGER NOT NULL,
    description TEXT,
    requirement_type VARCHAR(50) DEFAULT 'simple',
    is_flexible BOOLEAN DEFAULT FALSE,
    priority_order INTEGER DEFAULT 0,
    FOREIGN KEY (program_id) REFERENCES programs(id)
);
```

#### requirement_groups
```sql
CREATE TABLE requirement_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requirement_id INTEGER NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    courses_required INTEGER NOT NULL,
    credits_required INTEGER,
    min_credits_per_course INTEGER DEFAULT 0,
    max_credits_per_course INTEGER,
    description TEXT,
    is_required BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (requirement_id) REFERENCES program_requirements(id)
);
```

#### group_course_options
```sql
CREATE TABLE group_course_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    institution VARCHAR(100),
    is_preferred BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (group_id) REFERENCES requirement_groups(id)
);
```

#### plans
```sql
CREATE TABLE plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name VARCHAR(200) NOT NULL,
    student_email VARCHAR(200),
    program_id INTEGER NOT NULL,
    plan_name VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id)
);
```

#### plan_courses
```sql
CREATE TABLE plan_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    semester VARCHAR(50),
    year INTEGER,
    status VARCHAR(50) DEFAULT 'planned',
    grade VARCHAR(10),
    credits INTEGER,
    requirement_category VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (plan_id) REFERENCES plans(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE INDEX idx_plan_courses_plan ON plan_courses(plan_id);
CREATE INDEX idx_plan_courses_course ON plan_courses(course_id);
CREATE INDEX idx_plan_courses_status ON plan_courses(status);
```

---

## API Reference

### Base Configuration
- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **Error Format**: `{"error": "Error message"}`
- **Success Format**: `{"data": {...}}`

### Course Endpoints

#### GET /api/courses
Search and retrieve courses with pagination.

**Query Parameters**:
- `search` (string): Search term for code, title, or description
- `institution` (string): Filter by institution name
- `department` (string): Filter by department
- `page` (integer): Page number (default: 1)
- `per_page` (integer): Results per page (default: 20, max: 100)

**Response**:
```json
{
  "courses": [
    {
      "id": 1,
      "code": "BIOL 101",
      "title": "Introduction to Biology",
      "description": "Fundamental principles of biology...",
      "credits": 4,
      "institution": "Community College",
      "department": "Biology",
      "prerequisites": "MATH 120",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

#### GET /api/courses/{id}
Get detailed course information including equivalencies.

**Response**:
```json
{
  "course": {
    "id": 1,
    "code": "BIOL 101",
    "title": "Introduction to Biology",
    "description": "Fundamental principles of biology...",
    "credits": 4,
    "institution": "Community College",
    "department": "Biology",
    "prerequisites": "MATH 120",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  },
  "equivalency_status": "has_equivalents",
  "message": "Course has 2 equivalent(s)",
  "equivalencies": [
    {
      "type": "equivalent_to",
      "course": {
        "id": 2,
        "code": "BIO 1010",
        "title": "General Biology I",
        "credits": 4,
        "institution": "State University"
      },
      "equivalency": {
        "id": 1,
        "equivalency_type": "direct",
        "notes": "Direct transfer equivalency",
        "approved_by": "Dr. Smith",
        "approved_date": "2024-01-01T00:00:00"
      }
    }
  ]
}
```

#### POST /api/courses
Create a new course.

**Request Body**:
```json
{
  "code": "BIOL 102",
  "title": "Biology II",
  "description": "Advanced biology concepts",
  "credits": 4,
  "institution": "Community College",
  "department": "Biology",
  "prerequisites": "BIOL 101"
}
```

#### PUT /api/courses/{id}
Update an existing course.

#### DELETE /api/courses/{id}
Delete a course.

### Plan Endpoints

#### GET /api/plans
Retrieve all plans with optional filtering.

**Query Parameters**:
- `student_email` (string): Filter by student email
- `program_id` (integer): Filter by program ID

**Response**:
```json
{
  "plans": [
    {
      "id": 1,
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "program_id": 1,
      "plan_name": "Fall 2024 Transfer Plan",
      "status": "active",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00",
      "courses": [...]
    }
  ]
}
```

#### GET /api/plans/{id}
Get detailed plan information with progress analysis.

**Response**:
```json
{
  "id": 1,
  "student_name": "John Doe",
  "student_email": "john@example.com",
  "program_id": 1,
  "plan_name": "Fall 2024 Transfer Plan",
  "status": "active",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "courses": [...],
  "progress": {
    "total_credits_earned": 45,
    "total_credits_required": 120,
    "completion_percentage": 37.5,
    "remaining_credits": 75,
    "category_breakdown": {...},
    "requirement_progress": [...],
    "requirements_met": 3,
    "total_requirements": 8,
    "gpa_info": {
      "gpa": 3.25,
      "total_quality_points": 146.25,
      "total_credit_hours": 45,
      "graded_courses_count": 12
    },
    "transfer_analysis": {
      "transfer_courses": [...],
      "total_transfer_credits": 30,
      "transfer_courses_count": 8
    }
  },
  "unmet_requirements": [
    {
      "category": "Core Biology",
      "credits_needed": 16,
      "description": "Advanced biology coursework required for major"
    }
  ],
  "course_suggestions": [
    {
      "category": "Core Biology",
      "credits_needed": 16,
      "description": "Advanced biology coursework required for major",
      "course_options": [
        {
          "id": 15,
          "code": "BIO 301",
          "title": "Cell Biology",
          "credits": 4,
          "institution": "State University",
          "is_preferred": true
        }
      ],
      "transfer_options": [
        {
          "dcc_course": {
            "id": 8,
            "code": "BIOL 201",
            "title": "Cell Biology",
            "credits": 4,
            "institution": "Delgado Community College"
          },
          "uno_equivalent": {
            "id": 15,
            "code": "BIO 301",
            "title": "Cell Biology",
            "credits": 4
          },
          "equivalency_type": "direct",
          "notes": "Direct transfer with lab component"
        }
      ]
    }
  ]
}
```

#### POST /api/plans
Create a new academic plan.

**Request Body**:
```json
{
  "student_name": "Jane Smith",
  "student_email": "jane@example.com",
  "program_id": 1,
  "plan_name": "Spring 2025 Transfer Plan",
  "status": "draft"
}
```

**Response**: Returns created plan object with 201 status.

#### DELETE /api/plans/{id}
Delete a plan and all associated courses.

#### POST /api/plans/{plan_id}/courses
Add a course to a plan.

**Request Body**:
```json
{
  "course_id": 5,
  "semester": "Fall",
  "year": 2024,
  "status": "planned",
  "requirement_category": "Core Biology",
  "notes": "Required for major"
}
```

#### PUT /api/plans/{plan_id}/courses/{course_id}
Update a course in a plan.

**Request Body**:
```json
{
  "semester": "Spring",
  "year": 2025,
  "status": "completed",
  "grade": "A",
  "requirement_category": "Core Biology",
  "notes": "Completed with honors"
}
```

#### DELETE /api/plans/{plan_id}/courses/{course_id}
Remove a course from a plan.

#### GET /api/plans/{plan_id}/progress
Get detailed progress analysis for a plan.

**Response**:
```json
{
  "plan_id": 1,
  "progress": {
    "total_credits_earned": 45,
    "total_credits_required": 120,
    "completion_percentage": 37.5,
    "remaining_credits": 75,
    "category_breakdown": {
      "Core Biology": {
        "courses": [
          {
            "code": "BIOL 101",
            "title": "Introduction to Biology",
            "credits": 4,
            "grade": "A"
          }
        ],
        "total_credits": 12,
        "course_count": 3
      }
    },
    "requirement_progress": [
      {
        "id": 1,
        "category": "Core Biology",
        "credits_required": 32,
        "credits_completed": 12,
        "credits_remaining": 20,
        "completion_percentage": 37.5,
        "is_complete": false,
        "description": "Required biology courses for major",
        "requirement_type": "simple"
      }
    ]
  },
  "unmet_requirements": [...],
  "suggestions": [...]
}
```

### Equivalency Endpoints

#### GET /api/equivalencies
Retrieve course equivalencies with filtering.

**Query Parameters**:
- `from_institution` (string): Filter by source institution
- `to_institution` (string): Filter by target institution

**Response**:
```json
{
  "equivalencies": [
    {
      "id": 1,
      "from_course_id": 1,
      "to_course_id": 2,
      "from_course": {
        "id": 1,
        "code": "BIOL 101",
        "title": "Introduction to Biology",
        "credits": 4,
        "institution": "Community College"
      },
      "to_course": {
        "id": 2,
        "code": "BIO 1010",
        "title": "General Biology I",
        "credits": 4,
        "institution": "State University"
      },
      "equivalency_type": "direct",
      "notes": "Direct transfer equivalency",
      "approved_by": "Dr. Smith",
      "approved_date": "2024-01-01T00:00:00",
      "created_at": "2024-01-01T00:00:00"
    }
  ]
}
```

#### POST /api/equivalencies
Create a new course equivalency.

**Request Body**:
```json
{
  "from_course_id": 1,
  "to_course_id": 2,
  "equivalency_type": "direct",
  "notes": "Direct transfer equivalency",
  "approved_by": "Dr. Smith"
}
```

#### POST /api/equivalencies/no-equivalent
Create an explicit "no equivalent" record.

**Request Body**:
```json
{
  "from_course_id": 1,
  "notes": "Course has been evaluated and does not transfer",
  "approved_by": "Dr. Smith"
}
```

#### PUT /api/equivalencies/{id}
Update an existing equivalency.

#### DELETE /api/equivalencies/{id}
Delete an equivalency.

### Program Endpoints

#### GET /api/programs
Retrieve all programs.

**Response**:
```json
{
  "programs": [
    {
      "id": 1,
      "name": "Biology Major",
      "degree_type": "BS",
      "institution": "University of New Orleans",
      "total_credits_required": 120,
      "description": "Bachelor of Science in Biology",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00",
      "requirements": [
        {
          "id": 1,
          "program_id": 1,
          "category": "Core Biology",
          "credits_required": 32,
          "description": "Required biology courses for major",
          "requirement_type": "simple",
          "is_flexible": false,
          "priority_order": 1,
          "groups": []
        },
        {
          "id": 2,
          "program_id": 1,
          "category": "Humanities",
          "credits_required": 9,
          "description": "Liberal arts breadth requirement",
          "requirement_type": "grouped",
          "is_flexible": true,
          "priority_order": 5,
          "groups": [
            {
              "id": 1,
              "requirement_id": 2,
              "group_name": "Literature & Writing",
              "courses_required": 2,
              "credits_required": 6,
              "description": "Choose 2 literature/writing courses",
              "is_required": true,
              "course_options": [
                {
                  "id": 1,
                  "group_id": 1,
                  "course_code": "ENG 201",
                  "institution": "State University",
                  "is_preferred": true,
                  "notes": "Advanced composition"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

#### GET /api/programs/{id}
Get detailed program information with requirements analysis.

**Response**: Similar to above but with additional statistics:
```json
{
  "id": 1,
  "name": "Biology Major",
  "degree_type": "BS",
  "institution": "University of New Orleans",
  "total_credits_required": 120,
  "description": "Bachelor of Science in Biology",
  "requirements": [...],
  "requirements_analysis": [
    {
      "id": 1,
      "category": "Core Biology",
      "credits_required": 32,
      "requirement_type": "simple",
      "statistics": null
    },
    {
      "id": 2,
      "category": "Humanities",
      "credits_required": 9,
      "requirement_type": "grouped",
      "statistics": {
        "total_groups": 2,
        "total_course_options": 8,
        "preferred_options": 3
      }
    }
  ]
}
```

#### GET /api/programs/{program_id}/requirements/{requirement_id}/suggestions
Get course suggestions for a specific requirement.

**Response**:
```json
{
  "requirement": {
    "id": 2,
    "category": "Humanities",
    "credits_required": 9,
    "requirement_type": "grouped"
  },
  "suggestions": [
    {
      "group": {
        "id": 1,
        "group_name": "Literature & Writing",
        "courses_required": 2,
        "credits_required": 6
      },
      "course_options": [
        {
          "course": {
            "id": 15,
            "code": "ENG 201",
            "title": "Advanced Composition",
            "credits": 3,
            "institution": "State University"
          },
          "option_info": {
            "is_preferred": true,
            "notes": "Advanced composition"
          },
          "group_name": "Literature & Writing"
        }
      ]
    }
  ]
}
```

### Upload Endpoints

#### POST /api/upload/courses
Upload course catalog data via CSV.

**Request**: Multipart form data with `file` field containing CSV.

**CSV Format**:
```csv
code,title,description,credits,institution,department,prerequisites
"BIOL 101","Introduction to Biology","Fundamental principles...",4,"Community College","Biology",""
```

**Response**:
```json
{
  "message": "Upload completed",
  "courses_created": 25,
  "courses_updated": 5,
  "errors": [
    "Row 15: Missing required code or title",
    "Row 23: Invalid data format - invalid literal for int() with base 10: 'three'"
  ]
}
```

#### POST /api/upload/equivalencies
Upload course equivalency mappings via CSV.

**CSV Format**:
```csv
from_course_code,from_institution,to_course_code,to_institution,equivalency_type,notes,approved_by
"BIOL 101","Community College","BIO 1010","State University","direct","Direct transfer","Dr. Smith"
```

**Response**:
```json
{
  "message": "Upload completed",
  "equivalencies_created": 45,
  "equivalencies_updated": 8,
  "errors": []
}
```

#### POST /api/upload/requirements
Upload program requirements and grouping rules via CSV.

**CSV Format** (Complex grouped requirements):
```csv
program_name,category,credits_required,requirement_type,group_name,courses_required,credits_required_group,course_option,institution,is_preferred,description,group_description,option_notes
"Biology Major","Humanities",9,"grouped","Literature & Writing",2,6,"ENG 201","State University","true","Liberal arts requirement","Choose 2 literature courses","Advanced composition"
"Biology Major","Humanities",9,"grouped","Literature & Writing",2,6,"ENG 205","State University","false","Liberal arts requirement","Choose 2 literature courses","Creative writing"
"Biology Major","Core Biology",32,"simple","","","","","","","Required biology courses","",""
```

**Response**:
```json
{
  "message": "Requirements upload completed",
  "requirements_created": 8,
  "groups_created": 12,
  "options_created": 45,
  "errors": []
}
```

### Health Check Endpoint

#### GET /api/health
System health check.

**Response**:
```json
{
  "status": "healthy",
  "message": "Course Transfer API is running"
}
```

### Error Responses

All endpoints return consistent error responses:

**400 Bad Request**:
```json
{
  "error": "Missing required field: student_name"
}
```

**404 Not Found**:
```json
{
  "error": "Resource not found"
}
```

**413 Payload Too Large**:
```json
{
  "error": "File too large"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error"
}
```

---

## Development Setup

### Prerequisites

**System Requirements**:
- Python 3.8+ with pip
- Node.js 16+ with npm
- Git for version control
- SQLite (development) or PostgreSQL (production)

**Recommended Tools**:
- VS Code with Python and React extensions
- Postman for API testing
- DB Browser for SQLite for database inspection

### Backend Setup

1. **Clone Repository**:
```bash
git clone <repository-url>
cd course-transfer-system
```

2. **Create Virtual Environment**:
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

3. **Install Dependencies**:
```bash
pip install flask flask-sqlalchemy flask-migrate flask-cors
```

Create `requirements.txt`:
```txt
Flask==2.3.3
Flask-SQLAlchemy==3.0.5
Flask-Migrate==4.0.5
Flask-CORS==4.0.0
```

4. **Environment Configuration**:
Create `.env` file:
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///course_transfer.db
FLASK_ENV=development
FLASK_DEBUG=True
```

5. **Initialize Database**:
```bash
python -c "from app import create_app; app = create_app(); app.app_context().push(); from models import db; db.create_all()"
```

6. **Run Development Server**:
```bash
python app.py
```

Backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to Frontend Directory**:
```bash
cd frontend
```

2. **Install Dependencies**:
```bash
npm install react react-dom vite @vitejs/plugin-react tailwindcss lucide-react
```

Create `package.json`:
```json
{
  "name": "course-transfer-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "vite": "^4.4.5"
  }
}
```

3. **Configure Vite** (`vite.config.js`):
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

4. **Configure Tailwind CSS** (`tailwind.config.js`):
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

5. **PostCSS Configuration** (`postcss.config.js`):
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

6. **Run Development Server**:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Development Workflow

**Daily Development**:
1. Start backend: `cd backend && python app.py`
2. Start frontend: `cd frontend && npm run dev`
3. Both servers will auto-reload on code changes

**API Testing**:
- Use Postman or curl to test API endpoints
- Frontend proxy configuration handles CORS in development
- Check browser network tab for API request/response debugging

**Database Management**:
- Use SQLite browser to inspect database structure
- Flask-Migrate for schema changes (if implemented)
- Manual SQL scripts for data seeding

---

## Deployment Guide

### Production Environment Setup

#### Backend Deployment (Flask)

**1. Production Configuration**:
Create `config.py` production settings:
```python
class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://user:password@localhost/course_transfer'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY')
```

**2. WSGI Server Setup** (`wsgi.py`):
```python
from app import create_app

app = create_app('production')

if __name__ == "__main__":
    app.run()
```

**3. Requirements for Production**:
```txt
Flask==2.3.3
Flask-SQLAlchemy==3.0.5
Flask-Migrate==4.0.5
Flask-CORS==4.0.0
psycopg2-binary==2.9.7  # PostgreSQL adapter
gunicorn==21.2.0        # WSGI server
```

**4. Gunicorn Configuration** (`gunicorn.conf.py`):
```python
bind = "0.0.0.0:5000"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
```

**5. Environment Variables**:
```env
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:password@localhost/course_transfer
FLASK_ENV=production
```

**6. Database Setup (PostgreSQL)**:
```sql
CREATE DATABASE course_transfer;
CREATE USER course_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE course_transfer TO course_user;
```

**7. Run Production Server**:
```bash
gunicorn --config gunicorn.conf.py wsgi:app
```

#### Frontend Deployment (React)

**1. Build for Production**:
```bash
cd frontend
npm run build
```

**2. Static File Serving**:
The build creates a `dist/` directory with optimized static files.

**3. Web Server Configuration (Nginx)**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Serve React static files
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to Flask backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Handle file uploads
    client_max_body_size 16M;
}
```

#### Docker Deployment

**Backend Dockerfile**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 5000

CMD ["gunicorn", "--config", "gunicorn.conf.py", "wsgi:app"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://course_user:password@db:5432/course_transfer
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
    volumes:
      - ./backend:/app
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
      
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=course_transfer
      - POSTGRES_USER=course_user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

**Deploy with Docker**:
```bash
docker-compose up -d
```

### Production Monitoring

**Health Checks**:
- Monitor `/api/health` endpoint
- Database connection monitoring
- File upload directory space monitoring

**Logging Configuration**:
```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/course_transfer.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
```

**Performance Monitoring**:
- Monitor API response times
- Database query performance
- File upload processing times
- Memory and CPU usage

### Backup Strategy

**Database Backups**:
```bash
# Daily backup
pg_dump course_transfer > backups/course_transfer_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump course_transfer | gzip > $BACKUP_DIR/course_transfer_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "course_transfer_*.sql.gz" -mtime +30 -delete
```

**File System Backups**:
- Regular backups of uploaded CSV files
- Application code backups
- Configuration file backups

---

## Testing Strategy

### Unit Testing

#### Backend Testing (Python unittest)

**Test Structure**:
```
tests/
├── __init__.py
├── test_models.py
├── test_routes.py
├── test_api.py
└── conftest.py
```

**Model Testing** (`test_models.py`):
```python
import unittest
from app import create_app
from models import db, Course, Plan, Equivalency

class TestCourseModel(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_course_creation(self):
        course = Course(
            code='BIOL 101',
            title='Introduction to Biology',
            credits=4,
            institution='Test College'
        )
        db.session.add(course)
        db.session.commit()
        
        self.assertEqual(course.code, 'BIOL 101')
        self.assertEqual(course.credits, 4)
    
    def test_course_validation(self):
        course = Course()  # Missing required fields
        errors = course.validate()
        
        self.assertIn("Course code is required", errors)
        self.assertIn("Course title is required", errors)
        self.assertIn("Credits must be a positive number", errors)
    
    def test_equivalency_unique_constraint(self):
        course1 = Course(code='BIOL 101', title='Bio 1', credits=4, institution='CC')
        course2 = Course(code='BIO 1010', title='Bio 1', credits=4, institution='Univ')
        db.session.add_all([course1, course2])
        db.session.commit()
        
        equiv1 = Equivalency(from_course_id=course1.id, to_course_id=course2.id)
        equiv2 = Equivalency(from_course_id=course1.id, to_course_id=course2.id)
        
        db.session.add(equiv1)
        db.session.commit()
        
        db.session.add(equiv2)
        with self.assertRaises(Exception):  # Should raise IntegrityError
            db.session.commit()
```

**API Route Testing** (`test_routes.py`):
```python
import unittest
import json
from app import create_app
from models import db, Course, Program

class TestCourseRoutes(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        
        # Create test data
        self.test_course = Course(
            code='BIOL 101',
            title='Introduction to Biology',
            credits=4,
            institution='Test College'
        )
        db.session.add(self.test_course)
        db.session.commit()
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_get_courses(self):
        response = self.client.get('/api/courses')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('courses', data)
        self.assertIn('pagination', data)
        self.assertEqual(len(data['courses']), 1)
        self.assertEqual(data['courses'][0]['code'], 'BIOL 101')
    
    def test_course_search(self):
        response = self.client.get('/api/courses?search=biology')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data['courses']), 1)
    
    def test_create_course(self):
        course_data = {
            'code': 'CHEM 101',
            'title': 'General Chemistry',
            'credits': 4,
            'institution': 'Test College'
        }
        
        response = self.client.post(
            '/api/courses',
            data=json.dumps(course_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        
        # Verify course was created
        course = Course.query.filter_by(code='CHEM 101').first()
        self.assertIsNotNone(course)
        self.assertEqual(course.title, 'General Chemistry')
    
    def test_create_course_validation(self):
        invalid_course_data = {
            'code': '',  # Invalid: empty code
            'title': 'Test Course',
            'credits': -1,  # Invalid: negative credits
            'institution': 'Test College'
        }
        
        response = self.client.post(
            '/api/courses',
            data=json.dumps(invalid_course_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('errors', data)
```

**Progress Calculation Testing**:
```python
class TestPlanProgress(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        
        # Create test program with requirements
        self.program = Program(
            name='Test Biology Major',
            degree_type='BS',
            institution='Test University',
            total_credits_required=120
        )
        
        self.requirement = ProgramRequirement(
            program=self.program,
            category='Core Biology',
            credits_required=32,
            requirement_type='simple'
        )
        
        db.session.add_all([self.program, self.requirement])
        db.session.commit()
        
        # Create test plan
        self.plan = Plan(
            student_name='Test Student',
            program_id=self.program.id,
            plan_name='Test Plan'
        )
        db.session.add(self.plan)
        db.session.commit()
    
    def test_progress_calculation_empty_plan(self):
        progress = self.plan.calculate_progress()
        
        self.assertEqual(progress['total_credits_earned'], 0)
        self.assertEqual(progress['total_credits_required'], 120)
        self.assertEqual(progress['completion_percentage'], 0)
        self.assertEqual(progress['remaining_credits'], 120)
    
    def test# Course Transfer System - Technical Documentation

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Development Setup](#development-setup)
7. [Deployment Guide](#deployment-guide)
8. [Testing Strategy](#testing-strategy)
9. [Security Considerations](#security-considerations)
10. [Performance Optimization](#performance-optimization)
11. [Troubleshooting](#troubleshooting)

---

## System Architecture

### Overview
The Course Transfer System is a full-stack web application built with a Flask REST API backend and React frontend. The system manages course catalogs, transfer equivalencies, academic programs, and student transfer plans.

### Technology Stack

**Backend**:
- **Framework**: Flask 2.x with Flask-SQLAlchemy ORM
- **Database**: SQLite (development), PostgreSQL (production recommended)
- **API Design**: RESTful architecture with JSON responses
- **File Handling**: CSV upload processing with pandas/csv
- **CORS**: Flask-CORS for cross-origin requests
- **Migration**: Flask-Migrate for database schema management

**Frontend**:
- **Framework**: React 18+ with functional components and hooks
- **Build Tool**: Vite for development and bundling
- **Styling**: Tailwind CSS utility-first framework
- **Icons**: Lucide React icon library
- **HTTP Client**: Native fetch API with custom service layer
- **State Management**: React useState/useEffect hooks

**Development Tools**:
- **Package Management**: npm/yarn (frontend), pip (backend)
- **Code Organization**: Modular component architecture
- **Environment**: Separate development and production configurations

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │────│   Flask API     │────│   SQLite/PostgreSQL
│   (Port 5173)   │    │   (Port 5000)   │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Data Flow**:
1. User interactions in React components
2. API calls through service layer
3. Flask route handlers process requests
4. SQLAlchemy ORM interacts with database
5. JSON responses back to frontend
6. State updates trigger UI re-renders

---

## Backend Implementation

### Project Structure

```
backend/
├── app.py                 # Flask application factory
├── config.py             # Configuration classes
├── models/               # SQLAlchemy model definitions
│   ├── __init__.py       # Database initialization
│   ├── course.py         # Course model
│   ├── program.py        # Program and requirement models
│   ├── plan.py           # Student plan models
│   └── equivalency.py    # Course equivalency model
└── routes/               # API route handlers
    ├── __init__.py       # Route registration
    ├── courses.py        # Course management endpoints
    ├── programs.py       # Program management endpoints
    ├── plans.py          # Student plan endpoints
    ├── equivalencies.py  # Equivalency management endpoints
    └── upload.py         # CSV upload endpoints
```

### Flask Application Configuration

**app.py** - Application Factory Pattern:
```python
def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///course_transfer.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB file upload limit
    
    # Initialize extensions
    CORS(app)  # Enable cross-origin requests
    db = init_app(app)  # Initialize SQLAlchemy
    register_routes(app)  # Register API blueprints
    
    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    # Database creation
    with app.app_context():
        db.create_all()
    
    return app
```

**Configuration Classes** (config.py):
- `Config`: Base configuration with common settings
- `DevelopmentConfig`: Debug mode, SQLite database
- `ProductionConfig`: Production optimizations, PostgreSQL
- `TestingConfig`: In-memory database for testing

### Database Models

#### Core Model Relationships

```python
# Core entity relationships
Course 1---* Equivalency *---1 Course (from/to relationship)
Program 1---* ProgramRequirement 1---* RequirementGroup 1---* GroupCourseOption
Program 1---* Plan 1---* PlanCourse *---1 Course
ProgramRequirement 1---* RequirementGroup
```

#### Course Model (models/course.py)

```python
class Course(db.Model):
    __tablename__ = 'courses'
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), nullable=False, index=True)  # e.g., "BIOL 101"
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    credits = db.Column(db.Integer, nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100))
    prerequisites = db.Column(db.Text)  # Comma-separated course codes
    
    # Audit fields
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    equivalent_from = db.relationship('Equivalency', foreign_keys='Equivalency.from_course_id', backref='from_course')
    equivalent_to = db.relationship('Equivalency', foreign_keys='Equivalency.to_course_id', backref='to_course')
    
    def validate(self):
        """Validation logic for course data"""
        errors = []
        if not self.code or len(self.code.strip()) == 0:
            errors.append("Course code is required")
        if not self.title or len(self.title.strip()) == 0:
            errors.append("Course title is required")
        if not self.credits or self.credits <= -1:
            errors.append("Credits must be a positive number")
        if not self.institution or len(self.institution.strip()) == 0:
            errors.append("Institution is required")
        return errors
```

#### Program and Requirements Models (models/program.py)

**Program Model**:
```python
class Program(db.Model):
    __tablename__ = 'programs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)  # e.g., "Biology Major"
    degree_type = db.Column(db.String(50), nullable=False)  # BS, BA, AS, etc.
    institution = db.Column(db.String(100), nullable=False)
    total_credits_required = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    
    # Relationships
    requirements = db.relationship('ProgramRequirement', backref='program', cascade='all, delete-orphan')
    plans = db.relationship('Plan', backref='program')
```

**ProgramRequirement Model** - Supports three types:
1. **Simple**: Basic credit requirement (e.g., "32 credits of Core Biology")
2. **Grouped**: Choose X from Y options (e.g., "Choose 2 from Literature Group")
3. **Conditional**: Complex logic-based requirements

```python
class ProgramRequirement(db.Model):
    __tablename__ = 'program_requirements'
    
    id = db.Column(db.Integer, primary_key=True)
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    category = db.Column(db.String(100), nullable=False)  # e.g., "Humanities", "Core Biology"
    credits_required = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    requirement_type = db.Column(db.String(50), default='simple')  # simple, grouped, conditional
    is_flexible = db.Column(db.Boolean, default=False)
    priority_order = db.Column(db.Integer, default=0)
    
    # Relationships for grouped requirements
    groups = db.relationship('RequirementGroup', backref='requirement', cascade='all, delete-orphan')
    
    def evaluate_completion(self, student_courses):
        """Evaluate if requirement is satisfied by student's courses"""
        if self.requirement_type == 'simple':
            return self._evaluate_simple_requirement(student_courses)
        elif self.requirement_type == 'grouped':
            return self._evaluate_grouped_requirement(student_courses)
        # ... implementation details
```

**RequirementGroup Model** - For complex grouped requirements:
```python
class RequirementGroup(db.Model):
    __tablename__ = 'requirement_groups'
    
    id = db.Column(db.Integer, primary_key=True)
    requirement_id = db.Column(db.Integer, db.ForeignKey('program_requirements.id'), nullable=False)
    group_name = db.Column(db.String(100), nullable=False)  # e.g., "Literature & Writing"
    courses_required = db.Column(db.Integer, nullable=False)  # Number of courses needed
    credits_required = db.Column(db.Integer)  # Alternative: credit-based requirement
    min_credits_per_course = db.Column(db.Integer, default=0)
    max_credits_per_course = db.Column(db.Integer)
    description = db.Column(db.Text)
    is_required = db.Column(db.Boolean, default=True)
    
    # Course options for this group
    course_options = db.relationship('GroupCourseOption', backref='group', cascade='all, delete-orphan')
```

#### Plan Models (models/plan.py)

**Plan Model** - Student academic plans:
```python
class Plan(db.Model):
    __tablename__ = 'plans'
    
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(200), nullable=False)
    student_email = db.Column(db.String(200))
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    plan_name = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='draft')  # draft, active, completed
    created_at = db.Column(db.DateTime, server_default=func.now())
    updated_at = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    courses = db.relationship('PlanCourse', backref='plan', cascade='all, delete-orphan')
    
    def calculate_progress(self):
        """Complex progress calculation algorithm"""
        # Defensive programming against missing data
        program = getattr(self, 'program', None)
        requirements = getattr(program, 'requirements', []) if program else []
        required_credits = getattr(program, 'total_credits_required', 0) or 0

        # Calculate completed credits
        total_credits = sum(
            (course.credits or (course.course.credits if course.course else 0) or 0)
            for course in self.courses
            if course.status == 'completed'
        )

        # Analyze courses by status
        completed_courses = [course for course in self.courses if course.status == 'completed']
        planned_courses = [course for course in self.courses if course.status == 'planned']
        in_progress_courses = [course for course in self.courses if course.status == 'in_progress']

        # Category breakdown analysis
        category_breakdown = {}
        for course in completed_courses:
            category = course.requirement_category or 'Uncategorized'
            if category not in category_breakdown:
                category_breakdown[category] = {
                    'courses': [],
                    'total_credits': 0,
                    'course_count': 0
                }
            # ... detailed breakdown logic
        
        # Return comprehensive progress data
        return {
            'total_credits_earned': total_credits,
            'total_credits_required': required_credits,
            'completion_percentage': completion_percentage,
            'remaining_credits': max(0, required_credits - total_credits),
            'category_breakdown': category_breakdown,
            'requirement_progress': requirement_progress,
            # ... additional metrics
        }
```

**PlanCourse Model** - Junction table with additional plan-specific data:
```python
class PlanCourse(db.Model):
    __tablename__ = 'plan_courses'
    
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    
    # Scheduling information
    semester = db.Column(db.String(50))  # Fall, Spring, Summer
    year = db.Column(db.Integer)
    
    # Academic information
    status = db.Column(db.String(50), default='planned')  # planned, in_progress, completed
    grade = db.Column(db.String(10))  # A, B+, C, etc.
    credits = db.Column(db.Integer)  # Override course credits if needed
    requirement_category = db.Column(db.String(100))  # Which requirement this fulfills
    notes = db.Column(db.Text)
    
    # Relationships
    course = db.relationship('Course', backref='plan_courses')
```

#### Equivalency Model (models/equivalency.py)

```python
class Equivalency(db.Model):
    __tablename__ = 'equivalencies'
    
    id = db.Column(db.Integer, primary_key=True)
    from_course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    to_course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    equivalency_type = db.Column(db.String(50), default='direct')  # direct, partial, conditional, no_equiv
    notes = db.Column(db.Text)
    approved_by = db.Column(db.String(100))  # Who approved this equivalency
    approved_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint to prevent duplicate mappings
    __table_args__ = (db.UniqueConstraint('from_course_id', 'to_course_id', name='unique_equivalency'),)
```

### API Route Implementation

#### Course Routes (routes/courses.py)

**Course Search with Advanced Filtering**:
```python
@bp.route('', methods=['GET'])
def get_courses():
    # Extract query parameters
    search = request.args.get('search', '')
    institution = request.args.get('institution', '')
    department = request.args.get('department', '')
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)  # Limit page size
    
    # Build query with filters
    query = Course.query
    
    if search:
        query = query.filter(
            or_(
                Course.code.ilike(f'%{search}%'),
                Course.title.ilike(f'%{search}%'),
                Course.description.ilike(f'%{search}%')
            )
        )
    
    if institution:
        query = query.filter(Course.institution.ilike(f'%{institution}%'))
    
    if department:
        query = query.filter(Course.department.ilike(f'%{department}%'))
    
    # Implement pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    courses = pagination.items
    
    return jsonify({
        'courses': [course.to_dict() for course in courses],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    })
```

**Course Details with Equivalency Information**:
```python
@bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course = Course.query.get_or_404(course_id)
    
    # Get all equivalency records for this course
    all_equivalencies = Equivalency.query.filter_by(from_course_id=course_id).all()
    
    if not all_equivalencies:
        return jsonify({
            'course': course.to_dict(),
            'equivalency_status': 'not_evaluated',
            'message': 'No equivalency information available for this course',
            'equivalencies': []
        })
    
    # Categorize equivalencies
    no_equiv_records = []
    transfer_equivalencies = []
    
    for equiv in all_equivalencies:
        if equiv.to_course and equiv.to_course.code == '1000NE':  # Special "no equivalent" marker
            no_equiv_records.append({
                'type': 'no_equivalent',
                'equivalency': equiv.to_dict(),
                'message': 'This course does not transfer'
            })
        elif equiv.to_course:
            transfer_equivalencies.append({
                'type': 'equivalent_to',
                'course': equiv.to_course.to_dict(),
                'equivalency': equiv.to_dict()
            })
    
    # Determine overall status
    if no_equiv_records and not transfer_equivalencies:
        status = 'no_transfer'
        message = 'Course has been evaluated and does not transfer'
    elif transfer_equivalencies:
        status = 'has_equivalents'
        message = f'Course has {len(transfer_equivalencies)} equivalent(s)'
    else:
        status = 'unknown'
        message = 'Equivalency records exist but are unclear'
    
    return jsonify({
        'course': course.to_dict(),
        'equivalency_status': status,
        'message': message,
        'equivalencies': transfer_equivalencies + no_equiv_records
    })
```

#### Plan Routes (routes/plans.py)

**Plan Creation with Validation**:
```python
@bp.route('', methods=['POST'])
def create_plan():
    data = request.get_json()
    
    # Validate required fields
    if not data.get('student_name'):
        return jsonify({'error': 'Student name is required'}), 400
    if not data.get('plan_name'):
        return jsonify({'error': 'Plan name is required'}), 400
    
    # Verify program exists
    program = Program.query.get(data.get('program_id'))
    if not program:
        return jsonify({'error': 'Program not found'}), 404
    
    plan = Plan(
        student_name=data.get('student_name'),
        student_email=data.get('student_email'),
        program_id=data.get('program_id'),
        plan_name=data.get('plan_name'),
        status=data.get('status', 'draft')
    )
    
    try:
        db.session.add(plan)
        db.session.commit()
        return jsonify(plan.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create plan'}), 500
```

**Advanced Plan Details with Progress Calculation**:
```python
@bp.route('/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    plan = Plan.query.get_or_404(plan_id)
    
    # Serialize base plan data
    plan_data = plan.to_dict()
    
    # Add computed fields
    plan_data['progress'] = plan.calculate_progress()
    plan_data['unmet_requirements'] = plan.get_unmet_requirements()
    plan_data['course_suggestions'] = plan.suggest_courses_for_requirements()
    
    return jsonify(plan_data)
```

#### CSV Upload Routes (routes/upload.py)

**Course Upload with Error Handling**:
```python
@bp.route('/courses', methods=['POST'])
def upload_courses():
    # File validation
    if 'file' not in request.files:
        return jsonify({'error': 'File not Given'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'file not selected'}), 400
    
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        # Parse CSV with error tracking
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        courses_created = 0
        courses_updated = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Extract and validate data
                code = row.get('code', '').strip()
                title = row.get('title', '').strip()
                
                if not code or not title:
                    errors.append(f"Row {row_num}: Missing required code or title")
                    continue
                
                # Check for existing course
                existing_course = Course.query.filter_by(
                    code=code,
                    institution=row.get('institution', '').strip()
                ).first()
                
                if existing_course:
                    # Update existing course
                    existing_course.title = title
                    existing_course.description = row.get('description', '').strip()
                    existing_course.credits = int(row.get('credits', 0))
                    existing_course.department = row.get('department', '').strip()
                    existing_course.prerequisites = row.get('prerequisites', '').strip()
                    courses_updated += 1
                else:
                    # Create new course
                    course = Course(
                        code=code,
                        title=title,
                        description=row.get('description', '').strip(),
                        credits=int(row.get('credits', 0)),
                        institution=row.get('institution', '').strip(),
                        department=row.get('department', '').strip(),
                        prerequisites=row.get('prerequisites', '').strip()
                    )
                    
                    # Validate course data
                    validation_errors = course.validate()
                    if validation_errors:
                        errors.append(f"Row {row_num}: {', '.join(validation_errors)}")
                        continue
                    
                    db.session.add(course)
                    courses_created += 1
                    
            except ValueError as e:
                errors.append(f"Row {row_num}: Invalid data format - {str(e)}")
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        # Commit changes if any successful operations
        if courses_created > 0 or courses_updated > 0:
            db.session.commit()
        
        return jsonify({
            'message': 'Upload completed',
            'courses_created': courses_created,
            'courses_updated': courses_updated,
            'errors': errors
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500
```

---

## Frontend Implementation

### Project Structure

```
frontend/src/
├── main.jsx              # Application entry point
├── App.jsx               # Main application component
├── index.css             # Tailwind CSS imports
├── components/           # React components
│   ├── CourseSearch.jsx  # Course search and discovery
│   ├── PlanBuilder.jsx   # Academic plan management
│   ├── ProgressTracker.jsx # Degree progress tracking
│   ├── CSVUpload.jsx     # Bulk data upload
│   ├── CreatePlanModal.jsx # Plan creation modal
│   └── AddCourseToPlanModal.jsx # Course addition modal
└── services/
    └── api.js            # API service layer
```

### Application Architecture

**App.jsx** - Main application controller:
```jsx
const App = () => {
  // Global state management
  const [activeTab, setActiveTab] = useState('search');
  const [userMode, setUserMode] = useState('student');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [planRefreshTrigger, setPlanRefreshTrigger] = useState(0);
  
  // Modal state for course addition
  const [addCourseModal, setAddCourseModal] = useState({
    isOpen: false,
    courses: [],
    plan: null,
    program: null
  });

  // Navigation tabs configuration
  const tabs = [
    { id: 'search', label: 'Course Search', icon: Search },
    { id: 'plans', label: 'Academic Plans', icon: FileText },
    ...(userMode === 'advisor' ?
    [{ id: 'upload', label: 'CSV Upload', icon: Upload }] : []),
  ];

  // Load initial data
  React.useEffect(() => {
    loadPlansAndPrograms();
  }, []);

  // Unified handler for adding courses to plan
  const handleAddToPlan = async (courses) => {
    if (!selectedPlanId) {
      alert('Please select a plan first.');
      return;
    }

    try {
      // Refresh the selected plan before opening the modal
      const refreshedPlan = await api.getPlan(selectedPlanId);
      
      // Get matching program based on refreshed plan's program_id
      const refreshedProgram = programs.find(p => p.id === refreshedPlan.program_id) 
        || await api.getProgram(refreshedPlan.program_id);

      // Ensure courses is an array
      const coursesArray = Array.isArray(courses) ? courses : [courses];

      setAddCourseModal({
        isOpen: true,
        courses: coursesArray,
        plan: refreshedPlan,
        program: refreshedProgram
      });

    } catch (error) {
      console.error('Failed to load latest plan or program:', error);
      alert('Could not load plan data. Please try again.');
    }
  };

  // ... rest of component implementation
};
```

### API Service Layer (services/api.js)

**Centralized HTTP Client**:
```javascript
class ApiService {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }
  
  // Course management methods
  async searchCourses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/courses${queryString ? `?${queryString}` : ''}`);
  }

  async getCourse(id) {
    return this.request(`/courses/${id}`);
  }

  // Plan management methods
  async getPlans(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/plans${queryString ? `?${queryString}` : ''}`);
  }

  async getPlan(id) {
    return this.request(`/plans/${id}`);
  }

  async createPlan(data) {
    return this.request('/plans', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async addCourseToPlan(planId, data) {
    return this.request(`/plans/${planId}/courses`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // File upload methods
  async uploadCourses(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/upload/courses', {
      method: 'POST',
      headers: {}, // Let browser set multipart headers
      body: formData
    });
  }

  // ... additional methods
}

const api = new ApiService();
export default api;
```

### Component Implementations

#### CourseSearch Component

**Key Features**:
- Advanced search with multiple filters
- Real-time requirement category detection
- Multi-select functionality
- Equivalency information display
- Integration with plan management

**State Management**:
```jsx
const CourseSearch = ({ 
  onCourseSelect = null, 
  onMultiSelect = null, 
  planId = '', 
  setPlanId = null,
  onAddToPlan = null,
  program = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [institution, setInstitution] = useState('');
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [detectedCategories, setDetectedCategories] = useState(new Map());
  const [plans, setPlans] = useState([]);
```

**Intelligent Category Detection**:
```jsx
// Detect categories for each course based on program requirements
if (program && program.requirements && searchResults.length > 0) {
  const categoryMap = new Map();
  
  searchResults.forEach(course => {
    let detectedCategory = 'Elective';
    
    // Check if course matches any requirement group
    const match = program.requirements.find(req => {
      if (req.groups) {
        return req.groups.some(g => 
          g.course_options && 
          g.course_options.some(opt => opt.course_code === course.code)
        );
      }
      return false;
    });
    
    if (match) {
      detectedCategory = match.category;
    } else {
      // Try to match by department/subject code
      const courseSubject = course.code.match(/^[A-Z]+/)?.[0];
      if (courseSubject) {
        const deptMatch = program.requirements.find(req => {
          const reqName = req.category.toLowerCase();
          return (
            (courseSubject === 'BIOL' && reqName.includes('bio')) ||
            (courseSubject === 'CHEM' && reqName.includes('chem')) ||
            (courseSubject === 'MATH' && reqName.includes('math')) ||
            (courseSubject === 'PHYS' && reqName.includes('phys')) ||
            (courseSubject === 'ENG' && (reqName.includes('english') || reqName.includes('composition'))) ||
            // ... additional subject mappings
          );
        });
        if (deptMatch) detectedCategory = deptMatch.category;
      }
    }
    
    categoryMap.set(course.id, detectedCategory);
  });
  
  setDetectedCategories(categoryMap);
}
```

**Multi-Course Selection Logic**:
```jsx
const toggleCourseSelection = (course) => {
  const isSelected = selectedCourses.some((c) => c.id === course.id);
  if (isSelected) {
    setSelectedCourses(selectedCourses.filter((c) => c.id !== course.id));
  } else {
    // Add course with detected category
    const courseWithCategory = {
      ...course,
      detectedCategory: detectedCategories.get(course.id) || 'Elective'
    };
    setSelectedCourses([...selectedCourses, courseWithCategory]);
  }
};

const handleAddSelected = () => {
  if (onMultiSelect && selectedCourses.length > 0) {
    onMultiSelect(selectedCourses);
    setSelectedCourses([]);
  }
};
```

#### AddCourseToPlanModal Component

**Complex Course Assignment Logic**:
```jsx
const AddCourseToPlanModal = ({ 
  isOpen, 
  onClose, 
  courses = [], 
  plan,
  program,
  onCoursesAdded 
}) => {
  // Initialize form data for each course with smart defaults
  const initializeCourseData = () => {
    return courses.map(course => {
      let suggestedCategory = course.detectedCategory || 'Free Electives';
      let suggestedGroup = null;

      if (program && program.requirements) {
        // Find matching category by group membership
        const match = program.requirements.find(req => {
          if (req.groups) {
            const groupMatch = req.groups.find(g =>
              g.course_options?.some(opt => opt.course_code === course.code)
            );
            if (groupMatch) {
              suggestedGroup = groupMatch;
              suggestedCategory = req.category;
              return true;
            }
          }
          return false;
        });
      }

      return {
        course,
        requirement_category: suggestedCategory,
        requirement_group_id: suggestedGroup?.id || null,
        semester: 'Fall',
        year: new Date().getFullYear(),
        status: 'planned',
        grade: '',
        notes: ''
      };
    });
  };

  // State management for bulk operations
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [planCourses, setPlanCourses] = useState([]);
  const [requirementStatus, setRequirementStatus] = useState({});
  
  // Global settings for bulk operations
  const [applyToAll, setApplyToAll] = useState({
    semester: false,
    year: false,
    status: false,
    requirement_category: false
  });
```

**Requirement Status Calculation**:
```jsx
const calculateRequirementStatus = (currentCourses) => {
  if (!program || !program.requirements) return;

  const status = {};
  
  program.requirements.forEach(req => {
    const categoryStatus = {
      category: req.category,
      type: req.requirement_type,
      totalRequired: req.credits_required,
      totalCompleted: 0,
      groups: {}
    };

    // Get courses in this requirement category
    const categoryCourses = currentCourses.filter(c => 
      c.requirement_category === req.category
    );

    // Calculate total credits completed
    categoryStatus.totalCompleted = categoryCourses.reduce((sum, c) => 
      sum + (c.credits || c.course.credits || 0), 0
    );

    // Handle grouped requirements
    if (req.requirement_type === 'grouped' && req.groups) {
      req.groups.forEach(group => {
        // Find courses that match this specific group
        const groupCourses = categoryCourses.filter(planCourse => {
          return group.course_options?.some(opt => 
            opt.course_code === planCourse.course.code
          );
        });

        categoryStatus.groups[group.id] = {
          name: group.group_name,
          coursesRequired: group.courses_required,
          coursesCompleted: groupCourses.length,
          creditsRequired: group.credits_required,
          creditsCompleted: groupCourses.reduce((sum, c) => 
            sum + (c.credits || c.course.credits || 0), 0
          ),
          isFull: false
        };

        // Check if group is full
        if (group.courses_required) {
          categoryStatus.groups[group.id].isFull = 
            groupCourses.length >= group.courses_required;
        } else if (group.credits_required) {
          categoryStatus.groups[group.id].isFull = 
            categoryStatus.groups[group.id].creditsCompleted >= group.credits_required;
        }
      });
    }

    status[req.category] = categoryStatus;
  });

  setRequirementStatus(status);
};
```

**Course Assignment Validation**:
```jsx
const validateCourseAssignment = (courseIndex) => {
  const data = courseData[courseIndex];
  const requirement = program?.requirements?.find(req => 
    req.category === data.requirement_category
  );

  if (!requirement) return { valid: true };

  const categoryStatus = requirementStatus[data.requirement_category];
  if (!categoryStatus) return { valid: true };

  // Check if category is already full
  if (categoryStatus.totalCompleted >= categoryStatus.totalRequired) {
    return {
      valid: false,
      error: `${data.requirement_category} requirement already has ${categoryStatus.totalCompleted} of ${categoryStatus.totalRequired} required credits`
    };
  }

  // For grouped requirements, check specific group constraints
  if (requirement.requirement_type === 'grouped' && data.requirement_group_id) {
    const groupStatus = categoryStatus.groups[data.requirement_group_id];
    if (groupStatus && groupStatus.isFull) {
      return {
        valid: false,
        error: `${groupStatus.name} group already has the required ${
          groupStatus.coursesRequired ? 
          `${groupStatus.coursesRequired} course(s)` : 
          `${groupStatus.creditsRequired} credits`
        }`
      };
    }
  }

  return { valid: true };
};
```

**Bulk Operation Handling**:
```jsx
const updateCourseField = (index, field, value) => {
  const updated = [...courseData];
  updated[index][field] = value;
  
  // If changing requirement category, reset group selection
  if (field === 'requirement_category') {
    updated[index].requirement_group_id = null;
    
    // Auto-select group if only one available
    const availableGroups = getAvailableGroups(index);
    if (availableGroups.length === 1) {
      updated[index].requirement_group_id = availableGroups[0].id;
    }
  }
  
  // If "apply to all" is checked for this field, update all courses
  if (applyToAll[field]) {
    updated.forEach((data, i) => {
      if (i !== index) {
        data[field] = value;
        if (field === 'requirement_category') {
          data.requirement_group_id = null;
        }
      }
    });
  }
  
  setCourseData(updated);
};

const toggleApplyToAll = (field) => {
  const newApplyToAll = { ...applyToAll, [field]: !applyToAll[field] };
  setApplyToAll(newApplyToAll);
  
  // If turning on, apply the first course's value to all
  if (!applyToAll[field] && courseData.length > 0) {
    const value = courseData[0][field];
    const updated = courseData.map(data => ({ ...data, [field]: value }));
    setCourseData(updated);
  }
};
```

#### ProgressTracker Component

**Comprehensive Progress Analysis**:
```jsx
const ProgressTracker = ({ plan }) => {
  if (!plan || !plan.progress) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="mr-2" size={20} />
          Degree Progress
        </h3>
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>Progress information not available</p>
        </div>
      </div>
    );
  }

  const progress = plan.progress;
  const unmetRequirements = plan.unmet_requirements || [];
  const completionPercentage = Math.min(progress.completion_percentage || 0, 100);
  const isCompleted = completionPercentage >= 100;
```

**Course Grouping and Analysis**:
```jsx
const groupCoursesByRequirement = (courses) => {
  const grouped = {};
  courses.forEach(course => {
    const category = course.requirement_category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(course);
  });
  return grouped;
};

const getRequirementProgress = (category) => {
  const courses = coursesByRequirement[category] || [];
  const completedCourses = courses.filter(c => c.status === 'completed');
  const inProgressCourses = courses.filter(c => c.status === 'in_progress');
  const plannedCourses = courses.filter(c => c.status === 'planned');
  
  const completedCredits = completedCourses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0);
  const inProgressCredits = inProgressCourses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0);
  const plannedCredits = plannedCourses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0);
  
  return {
    completed: completedCredits,
    inProgress: inProgressCredits,
    planned: plannedCredits,
    total: completedCredits + inProgressCredits + plannedCredits,
    courses: courses
  };
};
```

**Dynamic Progress Visualization**:
```jsx
const getProgressColor = (percentage) => {
  if (percentage >= 100) return 'from-green-500 to-emerald-500';
  if (percentage >= 75) return 'from-blue-500 to-green-500';
  if (percentage >= 50) return 'from-yellow-500 to-blue-500';
  if (percentage >= 25) return 'from-orange-500 to-yellow-500';
  return 'from-red-500 to-orange-500';
};

const getProgressMessage = (percentage) => {
  if (percentage >= 100) return 'Congratulations! All requirements completed!';
  if (percentage >= 75) return 'You\'re almost there! Keep up the great work!';
  if (percentage >= 50) return 'Great progress! You\'re halfway there!';
  if (percentage >= 25) return 'Good start! Continue building your plan!';
  return 'This is the beginning of an incredible journey!';
};
```

#### CSVUpload Component

**Multi-Type Upload Handling**:
```jsx
const CSVUpload = () => {
  const [uploadType, setUploadType] = useState('courses');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // File validation
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadResult({ 
        error: 'Please upload a CSV file (.csv extension required)' 
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadResult({ 
        error: 'File size too large. Please upload files smaller than 10MB.' 
      });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      let result;
      switch (uploadType) {
        case 'courses':
          result = await api.uploadCourses(file);
          break;
        case 'equivalencies':
          result = await api.uploadEquivalencies(file);
          break;
        case 'requirements':
          result = await api.uploadRequirements(file);
          break;
        default:
          throw new Error('Invalid upload type');
      }
      
      setUploadResult(result);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResult({ error: error.message });
    } finally {
      setUploading(false);
    }
  };
```

**Drag and Drop Implementation**:
```jsx
const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);
  
  const file = e.dataTransfer.files[0];
  if (file) {
    handleFileUpload(file);
  }
};

const handleDrag = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.type === 'dragenter' || e.type === 'dragover') {
    setDragActive(true);
  } else if (e.type === 'dragleave') {
    setDragActive(false);
  }
};
```

**Sample CSV Generation**:
```jsx
const downloadSampleCSV = (type) => {
  let csvContent, filename;
  
  if (type === 'courses') {
    csvContent = `code,title,description,credits,institution,department,prerequisites
"BIOL 101","Introduction to Biology","Fundamental principles of biology including cell structure, genetics, and evolution.",4,"Community College","Biology",""
"MATH 151","Calculus I","Limits, derivatives, and applications of differential calculus.",4,"Community College","Mathematics","MATH 141"
// ... additional sample data
`;
    filename = 'sample_courses.csv';
  } else if (type === 'equivalencies') {
    csvContent = `from_course_code,from_institution,to_course_code,to_institution,equivalency_type,notes,approved_by
"BIOL 101","Community College","BIO 1010","State University","direct","Direct transfer equivalency","Dr. Smith"
// ... additional sample data
`;
    filename = 'sample_equivalencies.csv';
  } else if (type === 'requirements') {
    csvContent = `program_name,category,credits_required,requirement_type,group_name,courses_required,credits_required_group,course_option,institution,is_preferred,description,group_description,option_notes
"Biology Major","Humanities",9,"grouped","Literature & Writing",2,6,"ENG 201","State University","true","Liberal arts breadth requirement","Choose 2 literature/writing courses","Advanced composition"
// ... additional sample data
`;
    filename = 'sample_program_requirements.csv';
  }

  // Create and download blob
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     courses     │       │  equivalencies  │       │     courses     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ from_course_id  │       │ id (PK)         │
│ code            │       │ to_course_id    ├──────►│ code            │
│ title           │       │ equivalency_type│       │ title           │
│ description     │       │ notes           │       │ description     │
│ credits         │       │ approved_by     │       │ credits         │
│ institution     │       │ approved_date   │       │ institution     │
│ department      │       │ created_at      │       │ department      │
│ prerequisites   │       └─────────────────┘       │ prerequisites   │
│ created_at      │                                 │ created_at      │
│ updated_at      │                                 │ updated_at      │
└─────────────────┘                                 └─────────────────┘
                                                    
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    programs     │       │     plans       │       │   plan_courses  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ program_id      │       │ id (PK)         │
│ name            │       │ id (PK)         │◄──────┤ plan_id         │
│ degree_type     │       │ student_name    │       │ course_id       ├──┐
│ institution     │       │ student_email   │       │ semester        │  │
│ total_credits_  │       │ plan_name       │       │ year            │  │
│   required      │       │ status          │       │ status          │  │
│ description     │       │ created_at      │       │ grade           │  │
│ created_at      │       │ updated_at      │       │ credits         │  │
│ updated_at      │       └─────────────────┘       │ requirement_    │  │
└─────────────────┘                                 │   category      │  │
         │                                          │ notes           │  │
         │                                          └─────────────────┘  │
         ▼                                                               │
┌─────────────────┐                                                     │
│program_require- │                                                     │
│     ments       │                                                     │
├─────────────────┤                                                     │
│ id (PK)         │                                                     │
│ program_id      │                                                     │
│ category        │                                                     │
│ credits_required│                                                     │
│ description     │                                                     │
│ requirement_type│                                                     │
│ is_flexible     │                                                     │
│ priority_order  │                                                     │
└─────────────────┘                                                     │
         │                                                              │
         ▼                                                              │
┌─────────────────┐                                                     │
│requirement_     │                                                     │
│     groups      │                                                     │
├─────────────────┤                                                     │
│ id (PK)         │                                                     │
│ requirement_id  │                                                     │
│ group_name      │                                                     │
│ courses_required│                                                     │
│ credits_required│                                                     │
│ min_credits_per_│                                                     │
│   course        │                                                     │
│ max_credits_per_│                                                     │
│   course        │                                                     │
│ description     │                                                     │
│ is_required     │                                                     │
└─────────────────┘                                                     │
         │                                                              │
         ▼                                                              │
┌─────────────────┐                                          ┌─────────▼───────┐
│group_course_    │                                          │     courses     │
│    options      │                                          ├─────────────────┤
├─────────────────┤                                          │ id (PK)         │
│ id (PK)         │                                          │ code            │
│ group_id        │                                          │ title           │
│ course_code     │──────────────────────────────────────────│ description     │
│ institution     │                                          │ credits         │
│ is_preferred    │                                          │ institution     │
│ notes           │                                          │ department      │
└─────────────────┘                                          │ prerequisites   │
                                                             │ created_at      │
                                                             │ updated_at      │
                                                             └─────────────────┘
```

### Table Specifications

#### courses
```sql
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    institution VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    prerequisites TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_institution ON courses(institution);
CREATE INDEX idx_courses_department ON courses(department);
```

#### equivalencies
```sql
CREATE TABLE equivalencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_course_id INTEGER NOT NULL,
    to_course_id INTEGER NOT NULL,
    equivalency_type VARCHAR(50) DEFAULT 'direct',
    notes TEXT,
    approved_by VARCHAR(100),
    approved_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_course_id) REFERENCES courses(id),
    FOREIGN KEY (to_course_id) REFERENCES courses(id),
    UNIQUE(from_course_id, to_course_id)
);

CREATE INDEX idx_equivalencies_from_course ON equivalencies(from_course_id);
CREATE INDEX idx_equivalencies_to_course ON equivalencies(to_course_id);
```

#### programs
```sql
CREATE TABLE programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    degree_type VARCHAR(50) NOT NULL,
    institution VARCHAR(100) NOT NULL,
    total_credits_required INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### program_requirements
```sql
CREATE TABLE program_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    credits_required INTEGER NOT NULL,
    description TEXT,
    requirement_type VARCHAR(50) DEFAULT 'simple',
    is_flexible BOOLEAN DEFAULT FALSE,
    priority_order INTEGER DEFAULT 0,
    FOREIGN KEY (program_id) REFERENCES programs(id)
);
```

#### requirement_groups
```sql
CREATE TABLE requirement_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requirement_id INTEGER NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    courses_required INTEGER NOT NULL,
    credits_required INTEGER,
    min_credits_per_course INTEGER DEFAULT 0,
    max_credits_per_course INTEGER,
    description TEXT,
    is_required BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (requirement_id) REFERENCES program_requirements(id)
);
```

#### group_course_options
```sql
CREATE TABLE group_course_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    institution VARCHAR(100),
    is_preferred BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (group_id) REFERENCES requirement_groups(id)
);
```

#### plans
```sql
CREATE TABLE plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name VARCHAR(200) NOT NULL,
    student_email VARCHAR(200),
    program_id INTEGER NOT NULL,
    plan_name VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id)
);
```

#### plan_courses
```sql
CREATE TABLE plan_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    semester VARCHAR(50),
    year INTEGER,
    status VARCHAR(50) DEFAULT 'planned',
    grade VARCHAR(10),
    credits INTEGER,
    requirement_category VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (plan_id) REFERENCES plans(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE INDEX idx_plan_courses_plan ON plan_courses(plan_id);
CREATE INDEX idx_plan_courses_course ON plan_courses(course_id);
CREATE INDEX idx_plan_courses_status ON plan_courses(status);
```

---

## API Reference

### Base Configuration
- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **Error Format**: `{"error": "Error message"}`
- **Success Format**: `{"data": {...}}`

### Course Endpoints

#### GET /api/courses
Search and retrieve courses with pagination.

**Query Parameters**:
- `search` (string): Search term for code, title, or description
- `institution` (string): Filter by institution name
- `department` (string): Filter by department
- `page` (integer): Page number (default: 1)
- `per_page` (integer): Results per page (default: 20, max: 100)

**Response**:
```json
{
  "courses": [
    {
      "id": 1,
      "code": "BIOL 101",
      "title": "Introduction to Biology",
      "description": "Fundamental principles of biology...",
      "credits": 4,
      "institution": "Community College",
      "department": "Biology",
      "prerequisites": "MATH 120",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

#### GET /api/courses/{id}
Get detailed course information including equivalencies.

**Response**:
```json
{
  "course": {
    "id": 1,
    "code": "BIOL 101",
    "title": "Introduction to Biology",
    "description": "Fundamental principles of biology...",
    "credits": 4,
    "institution": "Community College",
    "department": "Biology",
    "prerequisites": "MATH 120",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  },
  "equivalency_status": "has_equivalents",
  "message": "Course has 2 equivalent(s)",
  "equivalencies": [
    {
      "type": "equivalent_to",
      "course": {
        "id": 2,
        "code": "BIO 1010",
        "title": "General Biology I",
        "credits": 4,
        "institution": "State University"
      },
      "equivalency": {
        "id": 1,
        "equivalency_type": "direct",
        "notes": "Direct transfer equivalency",
        "approved_by": "Dr. Smith",
        "approved_date": "2024-01-01T00:00:00"
      }
    }
  ]
}
```

#### POST /api/courses
Create a new course.

**Request Body**:
```json
{
  "code": "BIOL 102",
  "title": "Biology II",
  "description": "Advanced biology concepts",
  "credits": 4,
  "institution": "Community College",
  "department": "Biology",
  "prerequisites": "BIOL 101"
}
```

#### PUT /api/courses/{id}
Update an existing course.

#### DELETE /api/courses/{id}
Delete a course.

### Plan Endpoints

#### GET /api/plans
Retrieve all plans with optional filtering.

**Query Parameters**:
- `student_email` (string): Filter by student email
- `program_id` (integer): Filter by program ID

**Response**:
```json
{
  "plans": [
    {
      "id": 1,
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "program_id": 1,
      "plan_name": "Fall 2024 Transfer Plan",
      "status": "active",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00",
      "courses": [...]
    }
  ]
}
```

#### GET /api/plans/{id}
Get detailed plan information with progress analysis.

**Response**:
```json
{
  "id": 1,
  "student_name": "John Doe",
  "student_email": "john@example.com",
  "program_id": 1,
  "plan_name": "Fall 2024 Transfer Plan",
  "status": "active",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "courses": [...],
  "progress": {
    "total_credits_earned": 45,
    "total_credits_required": 120,
    "completion_percentage": 37.5,
    "remaining_credits": 75,
    "category_breakdown": {...},
    "requirement_progress": [...],
    "requirements_met": 3,
    "total_requirements": 8,
    "gpa_info": {
      "gpa": 3.25,
      "total_quality_points": 146.25,
      "total_credit_hours": 45,
      "graded_courses_count": 12
    },
    "transfer_analysis": {
      "transfer_courses": [...],
      "total_transfer_credits": 30,
      "transfer_courses_count": 8
    }
  },
  "unmet_requirements": [
    {
      "category": "Core Biology",
      "credits_needed": 16,
      "description": "Advanced biology coursework required for major"
    }
  ],
  "course_suggestions": [
    {
      "category": "Core Biology",
      "credits_needed": 16,
      "description": "Advanced biology coursework required for major",
      "course_options": [
        {
          "id": 15,
          "code": "BIO 301",
          "title": "Cell Biology",
          "credits": 4,
          "institution": "State University",
          "is_preferred": true
        }
      ],
      "transfer_options": [
        {
          "dcc_course": {
            "id": 8,
            "code": "BIOL 201",
            "title": "Cell Biology",
            "credits": 4,
            "institution": "Delgado Community College"
          },
          "uno_equivalent": {
            "id": 15,
            "code": "BIO 301",
            "title": "Cell Biology",
            "credits": 4
          },
          "equivalency_type": "direct",
          "notes": "Direct transfer with lab component"
        }
      ]
    }
  ]
}