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

## Security Considerations

### Authentication & Authorization

**Current State**: The system currently operates without authentication, suitable for internal institutional use.

**Recommended Enhancements**:

**1. User Authentication Implementation**:
```python
# Backend - JWT Authentication
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret')
jwt = JWTManager(app)

@bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Verify credentials (integrate with institutional LDAP/SSO)
    if verify_credentials(username, password):
        access_token = create_access_token(identity=username)
        return jsonify({'access_token': access_token})
    
    return jsonify({'error': 'Invalid credentials'}), 401

@bp.route('/api/plans', methods=['GET'])
@jwt_required()
def get_plans():
    current_user = get_jwt_identity()
    # Filter plans by user role and permissions
    # ... implementation
```

**2. Role-Based Access Control**:
```python
# User roles and permissions
ROLES = {
    'student': ['view_own_plans', 'create_plans', 'search_courses'],
    'advisor': ['view_all_plans', 'modify_plans', 'upload_data', 'manage_equivalencies'],
    'admin': ['full_access', 'user_management', 'system_configuration']
}

def require_permission(permission):
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            current_user = get_jwt_identity()
            user_role = get_user_role(current_user)
            
            if permission not in ROLES.get(user_role, []):
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@bp.route('/api/upload/courses', methods=['POST'])
@require_permission('upload_data')
def upload_courses():
    # Only advisors and admins can upload data
    # ... implementation
```

**3. Frontend Authentication Integration**:
```jsx
// services/auth.js
class AuthService {
  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  async login(username, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      this.token = data.access_token;
      localStorage.setItem('access_token', this.token);
      return true;
    }
    return false;
  }

  getAuthHeaders() {
    return this.token ? {
      'Authorization': `Bearer ${this.token}`
    } : {};
  }

  logout() {
    this.token = null;
    localStorage.removeItem('access_token');
  }
}

// api.js - Add auth headers to requests
async request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...authService.getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };
  // ... rest of implementation
}
```

### Input Validation & Sanitization

**1. Backend Input Validation**:
```python
from marshmallow import Schema, fields, validate, ValidationError

class CourseSchema(Schema):
    code = fields.Str(required=True, validate=validate.Length(min=1, max=20))
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str(validate=validate.Length(max=2000))
    credits = fields.Int(required=True, validate=validate.Range(min=0, max=12))
    institution = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    department = fields.Str(validate=validate.Length(max=100))
    prerequisites = fields.Str(validate=validate.Length(max=500))

@bp.route('/api/courses', methods=['POST'])
def create_course():
    schema = CourseSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    # Sanitize inputs
    data['code'] = bleach.clean(data['code'].strip())
    data['title'] = bleach.clean(data['title'].strip())
    
    # ... rest of implementation
```

**2. SQL Injection Prevention**:
```python
# Always use SQLAlchemy ORM or parameterized queries
# GOOD - ORM usage
courses = Course.query.filter(Course.code.ilike(f'%{search_term}%')).all()

# GOOD - Parameterized query if raw SQL needed
result = db.session.execute(
    text("SELECT * FROM courses WHERE code LIKE :search"),
    {'search': f'%{search_term}%'}
)

# BAD - Never do this
# query = f"SELECT * FROM courses WHERE code LIKE '%{search_term}%'"
```

**3. Frontend Input Validation**:
```jsx
// components/CreatePlanModal.jsx
const validateForm = () => {
  const newErrors = {};
  
  // Sanitize and validate student name
  const cleanName = DOMPurify.sanitize(formData.student_name.trim());
  if (!cleanName) {
    newErrors.student_name = 'Student name is required';
  } else if (cleanName.length > 200) {
    newErrors.student_name = 'Student name must be less than 200 characters';
  }
  
  // Validate email format
  if (formData.student_email && !isValidEmail(formData.student_email)) {
    newErrors.student_email = 'Please enter a valid email address';
  }
  
  // Validate plan name
  const cleanPlanName = DOMPurify.sanitize(formData.plan_name.trim());
  if (!cleanPlanName) {
    newErrors.plan_name = 'Plan name is required';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### File Upload Security

**1. Secure File Processing**:
```python
import tempfile
import os
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'csv'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/upload/courses', methods=['POST'])
def upload_courses():
    # Validate file presence
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    # Validate filename
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    # Check file size
    if request.content_length > MAX_FILE_SIZE:
        return jsonify({'error': 'File too large'}), 413
    
    # Secure filename and temporary storage
    filename = secure_filename(file.filename)
    
    # Process file in memory to avoid disk writes
    try:
        # Read and validate file content
        content = file.stream.read()
        if len(content) > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large'}), 413
        
        # Decode with error handling
        try:
            decoded_content = content.decode('utf-8')
        except UnicodeDecodeError:
            return jsonify({'error': 'Invalid file encoding. Please use UTF-8'}), 400
        
        # Process CSV content
        stream = io.StringIO(decoded_content, newline=None)
        # ... rest of CSV processing
        
    except Exception as e:
        app.logger.error(f'File processing error: {str(e)}')
        return jsonify({'error': 'Failed to process file'}), 500
```

**2. Frontend File Validation**:
```jsx
// components/CSVUpload.jsx
const validateFile = (file) => {
  const errors = [];
  
  // Check file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    errors.push('Please upload a CSV file (.csv extension required)');
  }
  
  // Check file size (16MB limit)
  if (file.size > 16 * 1024 * 1024) {
    errors.push('File size too large. Please upload files smaller than 16MB.');
  }
  
  // Check MIME type
  if (file.type && !['text/csv', 'application/csv'].includes(file.type)) {
    errors.push('Invalid file type. Please upload a CSV file.');
  }
  
  return errors;
};

const handleFileUpload = async (file) => {
  if (!file) return;
  
  const validationErrors = validateFile(file);
  if (validationErrors.length > 0) {
    setUploadResult({ error: validationErrors.join('. ') });
    return;
  }
  
  // ... rest of upload logic
};
```

### Data Protection

**1. Environment Variables & Secrets Management**:
```bash
# .env file (never commit to version control)
SECRET_KEY=your-super-secret-key-here-min-32-chars
DATABASE_URL=postgresql://user:password@localhost/course_transfer
JWT_SECRET_KEY=your-jwt-secret-key-here
UPLOAD_FOLDER=/secure/upload/path
```

**2. Database Security**:
```python
# config.py - Production security settings
class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    
    # Use environment variables for sensitive data
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("No SECRET_KEY set for Flask application")
    
    # Secure database connection
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security headers
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
```

**3. HTTPS & Security Headers**:
```python
from flask_talisman import Talisman

# Add security headers
Talisman(app, force_https=True)

# Custom security headers
@app.after_request
def after_request(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response
```

### CORS Security

**1. Restrictive CORS Configuration**:
```python
from flask_cors import CORS

# Production CORS settings
if app.config['ENV'] == 'production':
    CORS(app, 
         origins=['https://yourdomain.com'],
         methods=['GET', 'POST', 'PUT', 'DELETE'],
         allow_headers=['Content-Type', 'Authorization'])
else:
    # Development settings
    CORS(app)
```

---

## Performance Optimization

### Database Optimization

**1. Query Optimization & Indexing**:
```sql
-- Essential indexes for performance
CREATE INDEX idx_courses_search ON courses(institution, department, code);
CREATE INDEX idx_courses_fulltext ON courses USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_equivalencies_lookup ON equivalencies(from_course_id, to_course_id);
CREATE INDEX idx_plan_courses_status ON plan_courses(plan_id, status);
CREATE INDEX idx_plan_courses_category ON plan_courses(requirement_category, status);

-- Composite indexes for common queries
CREATE INDEX idx_courses_inst_dept ON courses(institution, department);
CREATE INDEX idx_plans_student ON plans(student_email, status);
```

**2. Efficient Query Patterns**:
```python
# Optimize course search with proper joins and pagination
@bp.route('/api/courses', methods=['GET'])
def get_courses():
    # Use select_related equivalent to avoid N+1 queries
    query = Course.query.options(
        db.joinedload(Course.equivalent_from),
        db.joinedload(Course.equivalent_to)
    )
    
    # Efficient search using database functions
    if search:
        # Use full-text search for better performance
        query = query.filter(
            db.func.to_tsvector('english', Course.title + ' ' + Course.description)
            .match(search)
        )
    
    # Always use pagination to limit memory usage
    pagination = query.paginate(
        page=page, 
        per_page=min(per_page, 100),  # Limit max page size
        error_out=False,
        max_per_page=100
    )
    
    return jsonify({
        'courses': [course.to_dict() for course in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages
        }
    })

# Optimize plan details with selective loading
@bp.route('/api/plans/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    # Load plan with related data in single query
    plan = Plan.query.options(
        db.joinedload(Plan.courses).joinedload(PlanCourse.course),
        db.joinedload(Plan.program).joinedload(Program.requirements)
    ).get_or_404(plan_id)
    
    # Cache heavy computations
    cache_key = f'plan_progress_{plan_id}_{plan.updated_at.isoformat()}'
    progress = cache.get(cache_key)
    
    if progress is None:
        progress = plan.calculate_progress()
        cache.set(cache_key, progress, timeout=300)  # 5 minute cache
    
    plan_data = plan.to_dict()
    plan_data['progress'] = progress
    
    return jsonify(plan_data)
```

**3. Database Connection Pooling**:
```python
# config.py - Database optimization
class ProductionConfig(Config):
    # Connection pool settings
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,  # Recycle connections after 1 hour
        'pool_pre_ping': True,  # Validate connections before use
        'max_overflow': 20,
        'pool_timeout': 30
    }
    
    # Query optimization
    SQLALCHEMY_RECORD_QUERIES = False  # Disable in production
    SQLALCHEMY_ECHO = False  # Disable SQL logging in production
```

### Frontend Performance

**1. Component Optimization**:
```jsx
// Memoization for expensive calculations
import React, { memo, useMemo, useCallback } from 'react';

const CourseSearch = memo(({ 
  onCourseSelect, 
  onMultiSelect, 
  program 
}) => {
  // Memoize expensive category detection
  const detectedCategories = useMemo(() => {
    if (!program?.requirements || !courses.length) return new Map();
    
    const categoryMap = new Map();
    courses.forEach(course => {
      const category = detectCourseCategory(course, program.requirements);
      categoryMap.set(course.id, category);
    });
    
    return categoryMap;
  }, [courses, program?.requirements]);

  // Memoize filtered courses
  const filteredCourses = useMemo(() => {
    if (categoryFilter === 'all') return courses;
    return courses.filter(course => 
      detectedCategories.get(course.id) === categoryFilter
    );
  }, [courses, categoryFilter, detectedCategories]);

  // Optimize event handlers
  const handleCourseToggle = useCallback((course) => {
    const isSelected = selectedCourses.some(c => c.id === course.id);
    if (isSelected) {
      setSelectedCourses(prev => prev.filter(c => c.id !== course.id));
    } else {
      setSelectedCourses(prev => [...prev, {
        ...course,
        detectedCategory: detectedCategories.get(course.id)
      }]);
    }
  }, [selectedCourses, detectedCategories]);

  return (
    // Component JSX
  );
});

export default CourseSearch;
```

**2. Virtual Scrolling for Large Lists**:
```jsx
// components/VirtualizedCourseList.jsx
import { FixedSizeList as List } from 'react-window';

const VirtualizedCourseList = ({ courses, onCourseSelect }) => {
  const CourseItem = ({ index, style }) => {
    const course = courses[index];
    
    return (
      <div style={style} className="border-b border-gray-200">
        <CourseCard 
          course={course} 
          onSelect={onCourseSelect}
        />
      </div>
    );
  };

  return (
    <List
      height={600}  // Fixed height container
      itemCount={courses.length}
      itemSize={120}  // Height of each course card
      width="100%"
    >
      {CourseItem}
    </List>
  );
};
```

**3. Lazy Loading & Code Splitting**:
```jsx
// App.jsx - Dynamic imports for code splitting
import { lazy, Suspense } from 'react';

const CourseSearch = lazy(() => import('./components/CourseSearch'));
const PlanBuilder = lazy(() => import('./components/PlanBuilder'));
const CSVUpload = lazy(() => import('./components/CSVUpload'));

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={<div>Loading...</div>}>
        {activeTab === 'search' && <CourseSearch />}
        {activeTab === 'plans' && <PlanBuilder />}
        {activeTab === 'upload' && <CSVUpload />}
      </Suspense>
    </div>
  );
};
```

### Caching Strategies

**1. Backend Caching**:
```python
from flask_caching import Cache

# Initialize cache
cache = Cache(app, config={
    'CACHE_TYPE': 'redis',
    'CACHE_REDIS_URL': os.environ.get('REDIS_URL', 'redis://localhost:6379')
})

# Cache expensive operations
@bp.route('/api/programs/<int:program_id>/requirements/<int:requirement_id>/suggestions')
@cache.cached(timeout=3600, key_prefix='requirement_suggestions')
def get_requirement_suggestions(program_id, requirement_id):
    # Expensive computation for course suggestions
    # ... implementation
    return jsonify(suggestions)

# Cache with dynamic keys
def get_plan_progress_cache_key(plan_id):
    plan = Plan.query.get(plan_id)
    return f'plan_progress_{plan_id}_{plan.updated_at.isoformat()}'

@bp.route('/api/plans/<int:plan_id>/progress')
def get_plan_progress(plan_id):
    cache_key = get_plan_progress_cache_key(plan_id)
    progress = cache.get(cache_key)
    
    if progress is None:
        plan = Plan.query.get_or_404(plan_id)
        progress = plan.calculate_progress()
        cache.set(cache_key, progress, timeout=300)
    
    return jsonify(progress)

# Invalidate cache when data changes
@bp.route('/api/plans/<int:plan_id>/courses', methods=['POST'])
def add_course_to_plan(plan_id):
    # ... add course logic
    
    # Invalidate related caches
    cache.delete(get_plan_progress_cache_key(plan_id))
    cache.delete_memoized(get_requirement_suggestions, plan.program_id)
    
    return jsonify(result)
```

**2. Frontend Caching**:
```jsx
// services/cache.js
class CacheService {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
  }

  set(key, value, ttl = 300000) { // 5 minutes default
    this.cache.set(key, value);
    
    // Clear existing timeout
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.timeouts.delete(key);
    }, ttl);
    
    this.timeouts.set(key, timeout);
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    this.cache.delete(key);
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
  }
}

const cacheService = new CacheService();

// api.js - Implement request caching
async searchCourses(params = {}) {
  const cacheKey = `courses_${JSON.stringify(params)}`;
  
  if (cacheService.has(cacheKey)) {
    return cacheService.get(cacheKey);
  }
  
  const result = await this.request(`/courses?${new URLSearchParams(params)}`);
  cacheService.set(cacheKey, result, 300000); // 5 minutes
  
  return result;
}
```

### Asset Optimization

**1. Vite Build Optimization**:
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lucide-react'],
        }
      }
    },
    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
```

**2. Image and Asset Optimization**:
```jsx
// Optimize image loading
const LazyImage = ({ src, alt, className }) => {
  return (
    <img 
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
};

// Optimize icon usage
import { Search, FileText, Upload } from 'lucide-react';

// Use sprite icons for repeated icons
const IconSprite = () => (
  <svg style={{ display: 'none' }}>
    <defs>
      <g id="search-icon">
        <Search size={16} />
      </g>
    </defs>
  </svg>
);
```

---

## Troubleshooting

### Common Issues & Solutions

#### Backend Issues

**1. Database Connection Errors**:
```bash
# Symptoms
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) could not connect to server

# Solutions
# Check database service status
sudo systemctl status postgresql

# Verify connection string
export DATABASE_URL="postgresql://user:password@localhost:5432/course_transfer"

# Test connection manually
psql postgresql://user:password@localhost:5432/course_transfer

# Common fixes
# - Ensure PostgreSQL is running
# - Check firewall settings
# - Verify user permissions
# - Check pg_hba.conf for authentication settings
```

**2. CSV Upload Failures**:
```python
# Common CSV upload issues and debugging
@bp.route('/upload/courses', methods=['POST'])
def upload_courses():
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        # Debug: Log first few rows
        rows = list(csv_reader)
        app.logger.info(f"CSV has {len(rows)} rows")
        app.logger.info(f"Headers: {rows[0].keys() if rows else 'No data'}")
        
        for row_num, row in enumerate(rows, start=2):
            try:
                # Log problematic rows
                if not row.get('code'):
                    app.logger.warning(f"Row {row_num}: Missing code - {row}")
                
                # ... processing logic
                
            except Exception as e:
                app.logger.error(f"Row {row_num} error: {str(e)} - Data: {row}")
                errors.append(f"Row {row_num}: {str(e)}")
                
    except UnicodeDecodeError as e:
        app.logger.error(f"File encoding error: {str(e)}")
        return jsonify({'error': 'File encoding issue. Please save as UTF-8'}), 400
    
    except Exception as e:
        app.logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500
```

**3. Memory Issues with Large Datasets**:
```python
# Process large CSV files in chunks
def process_large_csv(file_stream, chunk_size=1000):
    csv_reader = csv.DictReader(file_stream)
    
    chunk = []
    for row_num, row in enumerate(csv_reader, start=2):
        chunk.append(row)
        
        # Process in chunks to avoid memory issues
        if len(chunk) >= chunk_size:
            process_chunk(chunk)
            chunk = []
            
            # Commit periodically to avoid large transactions
            db.session.commit()
    
    # Process remaining rows
    if chunk:
        process_chunk(chunk)
        db.session.commit()

def process_chunk(rows):
    for row in rows:
        try:
            # Process individual row
            course = Course(**extract_course_data(row))
            db.session.add(course)
        except Exception as e:
            app.logger.error(f"Failed to process row: {e}")
            db.session.rollback()
```

#### Frontend Issues

**1. API Connection Issues**:
```jsx
// services/api.js - Add comprehensive error handling
class ApiService {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(url, config);
      
      // Handle different HTTP status codes
      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - redirect to login
          authService.logout();
          window.location.href = '/login';
          throw new Error('Session expired');
        }
        
        if (response.status === 403) {
          throw new Error('Insufficient permissions');
        }
        
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      // Network or parsing errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
      
      console.error('API Request failed:', error);
      throw error;
    }
  }
}

// Component error handling
const CourseSearch = () => {
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const searchCourses = async (retryAttempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.searchCourses(params);
      setCourses(response.courses);
      setRetryCount(0); // Reset on success
      
    } catch (error) {
      console.error('Search failed:', error);
      
      // Implement retry logic
      if (retryAttempt < 3 && error.message.includes('Network')) {
        setTimeout(() => {
          searchCourses(retryAttempt + 1);
        }, 1000 * Math.pow(2, retryAttempt)); // Exponential backoff
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => searchCourses()}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      )}
      {/* Rest of component */}
    </div>
  );
};
```

**2. Performance Issues**:
```jsx
// Debug slow components
import { Profiler } from 'react';

const App = () => {
  const onRenderCallback = (id, phase, actualDuration) => {
    if (actualDuration > 16) { // Longer than one frame (60fps)
      console.warn(`Slow render: ${id} took ${actualDuration}ms in ${phase} phase`);
    }
  };

  return (
    <Profiler id="App" onRender={onRenderCallback}>
      {/* App content */}
    </Profiler>
  );
};

// Identify memory leaks
useEffect(() => {
  const interval = setInterval(() => {
    // Heavy operation
    heavyCalculation();
  }, 1000);

  // Always clean up intervals and event listeners
  return () => {
    clearInterval(interval);
  };
}, []);

// Monitor component re-renders
const useRenderCount = (componentName) => {
  const renderCount = useRef(0);
  renderCount.current++;
  
  console.log(`${componentName} rendered ${renderCount.current} times`);
  
  return renderCount.current;
};

// Usage
const PlanBuilder = () => {
  const renderCount = useRenderCount('PlanBuilder');
  
  // If this logs frequently, investigate unnecessary re-renders
  // ... component logic
};
```

**3. State Management Issues**:
```jsx
// Debug state updates
const useStateLogger = (stateName, state) => {
  useEffect(() => {
    console.log(`${stateName} updated:`, state);
  }, [stateName, state]);
};

// Usage
const [plans, setPlans] = useState([]);
useStateLogger('plans', plans);

// Prevent unnecessary state updates
const updatePlanCourse = useCallback((planId, courseId, updates) => {
  setPlans(prevPlans => 
    prevPlans.map(plan => {
      if (plan.id !== planId) return plan;
      
      return {
        ...plan,
        courses: plan.courses.map(course => 
          course.id === courseId 
            ? { ...course, ...updates }
            : course
        )
      };
    })
  );
}, []);

// Use reducer for complex state logic
const planReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_COURSE':
      return {
        ...state,
        courses: [...state.courses, action.course]
      };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.courseId
            ? { ...course, ...action.updates }
            : course
        )
      };
    case 'REMOVE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(course => course.id !== action.courseId)
      };
    default:
      return state;
  }
};
```

### System Diagnostics

**1. Backend Health Monitoring**:
```python
# routes/diagnostics.py
import psutil
import time
from datetime import datetime

@bp.route('/api/system/health', methods=['GET'])
def system_health():
    """Comprehensive system health check"""
    
    health_data = {
        'timestamp': datetime.utcnow().isoformat(),
        'status': 'healthy',
        'checks': {}
    }
    
    # Database connectivity
    try:
        db.session.execute(text('SELECT 1'))
        health_data['checks']['database'] = {
            'status': 'healthy',
            'response_time_ms': measure_db_response_time()
        }
    except Exception as e:
        health_data['checks']['database'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        health_data['status'] = 'unhealthy'
    
    # System resources
    health_data['checks']['system'] = {
        'cpu_percent': psutil.cpu_percent(),
        'memory_percent': psutil.virtual_memory().percent,
        'disk_percent': psutil.disk_usage('/').percent
    }
    
    # Application metrics
    health_data['checks']['application'] = {
        'uptime_seconds': time.time() - app.start_time,
        'active_connections': get_active_connections(),
        'cache_hit_ratio': get_cache_hit_ratio()
    }
    
    return jsonify(health_data)

def measure_db_response_time():
    """Measure database response time"""
    start_time = time.time()
    db.session.execute(text('SELECT COUNT(*) FROM courses'))
    return (time.time() - start_time) * 1000

@bp.route('/api/system/logs', methods=['GET'])
def get_recent_logs():
    """Get recent application logs for debugging"""
    try:
        with open('logs/course_transfer.log', 'r') as f:
            lines = f.readlines()
            # Return last 100 lines
            recent_logs = lines[-100:]
            
        return jsonify({
            'logs': recent_logs,
            'total_lines': len(lines)
        })
    except FileNotFoundError:
        return jsonify({'error': 'Log file not found'}), 404
```

**2. Frontend Debug Tools**:
```jsx
// utils/debug.js
export const DebugPanel = ({ isOpen, onClose }) => {
  const [apiCalls, setApiCalls] = useState([]);
  const [performance, setPerformance] = useState({});
  
  useEffect(() => {
    // Monitor API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const response = await originalFetch(...args);
      const duration = performance.now() - start;
      
      setApiCalls(prev => [...prev, {
        url: args[0],
        method: args[1]?.method || 'GET',
        duration: Math.round(duration),
        status: response.status,
        timestamp: new Date().toISOString()
      }]);
      
      return response;
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
  
  const clearLogs = () => {
    setApiCalls([]);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-0 right-0 w-96 h-64 bg-black text-white p-4 overflow-auto font-mono text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3>Debug Panel</h3>
        <div>
          <button onClick={clearLogs} className="mr-2 text-yellow-400">Clear</button>
          <button onClick={onClose} className="text-red-400">×</button>
        </div>
      </div>
      
      <div className="space-y-1">
        {apiCalls.slice(-10).map((call, index) => (
          <div key={index} className={`text-xs ${
            call.status >= 400 ? 'text-red-400' : 'text-green-400'
          }`}>
            {call.method} {call.url} - {call.duration}ms ({call.status})
          </div>
        ))}
      </div>
    </div>
  );
};

// Add to App.jsx for development
const App = () => {
  const [showDebug, setShowDebug] = useState(false);
  
  useEffect(() => {
    // Show debug panel with Ctrl+Shift+D
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div>
      {/* Main app content */}
      <DebugPanel isOpen={showDebug} onClose={() => setShowDebug(false)} />
    </div>
  );
};
```

### Error Reporting & Monitoring

**1. Backend Error Tracking**:
```python
# utils/error_tracking.py
import traceback
import uuid
from datetime import datetime

class ErrorTracker:
    def __init__(self, app):
        self.app = app
        self.setup_handlers()
    
    def setup_handlers(self):
        @self.app.errorhandler(Exception)
        def handle_exception(e):
            error_id = str(uuid.uuid4())
            
            error_data = {
                'error_id': error_id,
                'timestamp': datetime.utcnow().isoformat(),
                'type': type(e).__name__,
                'message': str(e),
                'traceback': traceback.format_exc(),
                'url': request.url if request else None,
                'method': request.method if request else None,
                'user_agent': request.headers.get('User-Agent') if request else None,
                'remote_addr': request.remote_addr if request else None
            }
            
            # Log error
            self.app.logger.error(f"Error {error_id}: {error_data}")
            
            # Send to monitoring service (e.g., Sentry)
            # sentry_sdk.capture_exception(e)
            
            if isinstance(e, HTTPException):
                return e
            
            return jsonify({
                'error': 'Internal server error',
                'error_id': error_id
            }), 500

# Initialize error tracking
error_tracker = ErrorTracker(app)
```

**2. Frontend Error Boundaries**:
```jsx
// components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to monitoring service
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    // Send to error tracking service
    // this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Send to your error reporting service
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport)
    }).catch(console.error);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Something went wrong
                </h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>We're sorry, but something unexpected happened.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in App.jsx
const App = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        {/* App content */}
      </div>
    </ErrorBoundary>
  );
};
```

### Database Debugging

**1. Query Performance Analysis**:
```python
# utils/db_profiler.py
import time
from sqlalchemy import event
from sqlalchemy.engine import Engine

class QueryProfiler:
    def __init__(self):
        self.queries = []
        self.setup_listeners()
    
    def setup_listeners(self):
        @event.listens_for(Engine, "before_cursor_execute")
        def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            context._query_start_time = time.time()
        
        @event.listens_for(Engine, "after_cursor_execute")
        def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            total = time.time() - context._query_start_time
            
            if total > 0.1:  # Log slow queries (>100ms)
                app.logger.warning(f"Slow query ({total:.2f}s): {statement[:200]}")
            
            self.queries.append({
                'query': statement,
                'parameters': parameters,
                'duration': total,
                'timestamp': time.time()
            })
    
    def get_recent_queries(self, limit=50):
        return self.queries[-limit:]
    
    def get_slow_queries(self, threshold=0.1):
        return [q for q in self.queries if q['duration'] > threshold]

# Initialize profiler
if app.debug:
    query_profiler = QueryProfiler()
```

**2. Database Migration Issues**:
```bash
# Common migration commands and troubleshooting

# Check current migration status
flask db current

# Show migration history
flask db history

# Create new migration
flask db migrate -m "Add new index for performance"

# Apply migrations
flask db upgrade

# Rollback to previous migration
flask db downgrade

# Fix common migration issues

# Issue: Migration conflicts
# Solution: Create merge migration
flask db merge -m "Merge conflicting migrations"

# Issue: Data migration needed
# Create empty migration and add data operations
flask db revision -m "Data migration for course codes"

# Edit the generated migration file:
"""
def upgrade():
    # Schema changes first
    op.add_column('courses', sa.Column('normalized_code', sa.String(20)))
    
    # Data migration
    connection = op.get_bind()
    result = connection.execute(text("SELECT id, code FROM courses"))
    for row in result:
        normalized = row.code.upper().replace(' ', '')
        connection.execute(
            text("UPDATE courses SET normalized_code = :norm WHERE id = :id"),
            {'norm': normalized, 'id': row.id}
        )

def downgrade():
    op.drop_column('courses', 'normalized_code')
"""
```

### Deployment Troubleshooting

**1. Docker Issues**:
```bash
# Common Docker debugging commands

# Check container logs
docker logs course-transfer-backend
docker logs course-transfer-frontend

# Debug container startup
docker run -it course-transfer-backend /bin/bash

# Check network connectivity
docker network ls
docker network inspect course-transfer_default

# Database connection issues
docker exec -it course-transfer-db psql -U course_user -d course_transfer

# Volume mounting issues
docker volume ls
docker volume inspect course-transfer_postgres_data

# Fix common issues

# Issue: Port conflicts
# Check what's using the port
netstat -tulpn | grep :5000
# Kill process or change port in docker-compose.yml

# Issue: Permission denied on volumes
# Fix volume permissions
sudo chown -R $USER:$USER ./data
sudo chmod -R 755 ./data

# Issue: Out of disk space
# Clean up Docker
docker system prune -a
docker volume prune
```

**2. Nginx Configuration Issues**:
```nginx
# /etc/nginx/sites-available/course-transfer
server {
    listen 80;
    server_name your-domain.com;
    
    # Enable detailed logging for debugging
    access_log /var/log/nginx/course-transfer.access.log;
    error_log /var/log/nginx/course-transfer.error.log debug;
    
    # Frontend static files
    location / {
        root /var/www/course-transfer/dist;
        try_files $uri $uri/ /index.html;
        
        # Add headers for debugging
        add_header X-Served-By nginx;
        add_header X-Content-Type-Options nosniff;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Debugging headers
        proxy_set_header X-Debug-Backend $proxy_host;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # File upload size
        client_max_body_size 16M;
    }
}

# Test nginx configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx

# Monitor nginx logs in real-time
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/course-transfer.error.log
```

### Performance Troubleshooting

**1. Slow API Responses**:
```python
# Add request timing middleware
@app.before_request
def before_request():
    g.start_time = time.time()

@app.after_request
def after_request(response):
    if hasattr(g, 'start_time'):
        duration = time.time() - g.start_time
        if duration > 1.0:  # Log slow requests
            app.logger.warning(f"Slow request: {request.endpoint} took {duration:.2f}s")
    return response

# Profile specific endpoints
from werkzeug.middleware.profiler import ProfilerMiddleware

if app.config.get('PROFILING'):
    app.wsgi_app = ProfilerMiddleware(app.wsgi_app, restrictions=[30])
```

**2. Memory Usage Issues**:
```python
import psutil
import os

def log_memory_usage():
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    app.logger.info(f"Memory usage: {memory_info.rss / 1024 / 1024:.2f} MB")

# Call before heavy operations
@bp.route('/api/upload/courses', methods=['POST'])
def upload_courses():
    log_memory_usage()
    
    # Process file
    result = process_csv_file(file)
    
    log_memory_usage()
    return jsonify(result)
```

---

## Conclusion

This comprehensive technical documentation covers all aspects of the Course Transfer System, from architecture and implementation to deployment and troubleshooting. The system is designed to be scalable, maintainable, and user-friendly while handling complex academic requirements and transfer scenarios.

### Key Strengths

1. **Modular Architecture**: Clean separation between frontend and backend with well-defined APIs
2. **Flexible Requirements Engine**: Supports simple, grouped, and conditional academic requirements
3. **Robust File Processing**: Handles large CSV uploads with comprehensive error reporting
4. **Real-time Progress Tracking**: Dynamic calculation of degree completion progress
5. **Intelligent Course Categorization**: Automatic detection of requirement categories
6. **Comprehensive Error Handling**: Both frontend and backend error management

### Future Enhancements

1. **Authentication Integration**: LDAP/SSO integration for institutional users
2. **Advanced Analytics**: Reporting and analytics for transfer patterns
3. **Mobile Responsive Design**: Enhanced mobile experience
4. **Automated Testing**: Comprehensive test suite for all components
5. **API Rate Limiting**: Protection against abuse and overload
6. **Real-time Notifications**: WebSocket integration for live updates

### Support and Maintenance

- Regular database maintenance and optimization
- Monitoring of system performance and usage patterns  
- Periodic security audits and updates
- User training and documentation updates
- Backup and disaster recovery procedures

This documentation serves as a complete reference for developers, administrators, and stakeholders involved in the Course Transfer System project.