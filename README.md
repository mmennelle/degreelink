# Course Equivalency and Transfer Planning System

**Production Domain:** dlink.cs.uno.edu  
**Current Branch:** dev-main  
**Status:** Production ready with TOTP authentication

## Documentation

**Start Here:** [Current System Status](docs/CURRENT_SYSTEM_STATUS.md) - Complete system overview

### For Advisors & Users
- **[Advisor Guide](docs/ADVISOR_GUIDE.md)** - Complete guide for academic advisors
- **[User Guide - Program Requirements](docs/USER_GUIDE_PROGRAM_REQUIREMENTS.md)** - How to upload and manage program requirements
- **[CSV Format Guide](docs/UNIFIED_CSV_FORMAT.md)** - CSV file format specification

### For Developers
- **[System Architecture & Features](docs/CURRENT_SYSTEM_STATUS.md)** - Technical overview
- **[GitHub Wiki Structure](docs/GITHUB_WIKI_STRUCTURE.md)** - Recommended developer documentation organization
- **[Advisor Authentication](docs/ADVISOR_AUTH_IMPLEMENTATION.md)** - TOTP authentication system
- **[Prerequisite System](docs/PREREQUISITE_IMPLEMENTATION.md)** - Course prerequisite validation
- **[Constraint System](docs/CONSTRAINT_IMPLEMENTATION.md)** - Requirement constraint validation
- **[Database Migrations](docs/MIGRATIONS_README.md)** - Flask-Migrate guide

### Recent Updates (November 2025)
- **TOTP Authentication** - Migrated to Time-based One-Time Passwords (Google Authenticator, Authy, etc.)
- **Advisor Privileges** - Advisors have full administrative privileges
- **QR Code Setup** - First-time authenticator setup with QR code scanning
- **TOTP Regeneration** - Reset authenticator on lost/new devices
- **Email Fallback** - Backup authentication method for troubleshooting

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and ADMIN_API_TOKEN

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

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Build
```bash
cd frontend
npm run build
```

## Backend Tester (Development)

### Steps
1. Initialize database: `python init_db.py`
2. Start Flask backend: `flask run`
3. Open `backend-tester.html` in web browser
4. Verify connection test shows green success
5. Test endpoints in order:
   - Basic Data (institutions, departments, courses)
   - Programs (create, analyze)
   - Transfer Plans (create, retrieve)
   - CSV Import

### Quick Test Sequence
1. GET /institutions
2. GET /departments
3. GET /courses
4. POST /programs
5. POST /create-plan
6. GET /get-plan/{code}


## Phase 1 feature flags (grouped evaluation + auto-assignment)

This project now supports stricter grouped requirement evaluation and automatic group assignment behind feature flags. These are off by default to preserve current behavior and can be enabled per environment.

- PROGRESS_USE_GROUPED_EVALUATION (default: false)
    - When true, progress/audit for requirement_type='grouped' uses the strict evaluator (ProgramRequirement.evaluate_completion). Group rules like courses_required or credits_required at the group level are enforced. Zero-credit, course-count-only groups (e.g., exit exams) will show as complete when satisfied.
    - API remains backward-compatible and adds a non-breaking field group_results to grouped requirement entries for transparency.

- AUTO_ASSIGN_REQUIREMENT_GROUPS (default: false)
    - When true, newly added or updated plan courses are automatically assigned to a RequirementGroup if their code matches a GroupCourseOption in the target program. If multiple matches exist, options marked is_preferred are chosen first; otherwise a deterministic order is applied.

Enable flags in bash (Linux/macOS):

```bash
export PROGRESS_USE_GROUPED_EVALUATION=true
export AUTO_ASSIGN_REQUIREMENT_GROUPS=true
# then start the backend as you normally do
```

Effects you should see when enabled:
- Grouped requirements honor the exact course options you list in your CSV uploads (docs/equic-csvs/*). Courses not listed won't be counted toward grouped requirements.
- Responses include group_results detailing which groups are satisfied and which courses were used.
- Zero-credit groups that require a specific number of courses will be considered met when the count is satisfied.

Authoring tips for grouped requirements:
- Enumerate explicit course codes in the course_option column for each group. Use is_preferred to guide auto-assignment.
- To avoid mixing tracks (e.g., PHYS 103x vs 106x), place each track in a separate group under the same category.

To revert to legacy behavior:
- Set both flags to false (or unset them) and restart the backend.


## Integrating Advisor Center

The Advisor Center is a main navigation section for advisors with sub-tabs for Student Plans and Degree Audit. It uses a wrapper component pattern for organized navigation.

### Navigation Structure

The system uses grouped navigation tabs:
- **Program Management**: Programs, CSV Upload
- **Advisor Center**: Student Plans, Degree Audit (advisor-only)
- **App Settings**: Administrative functions

### Route Configuration

In your frontend router (App.jsx):

```javascript
import AdvisorCenterPage from './pages/AdvisorCenterPage';
import ProgramManagementPage from './pages/ProgramManagementPage';

// Advisor-only route with sub-tab wrapper
<Route
  path="/advisor-center"
  element={
    <AdvisorCenterPage
      selectedPlanId={selectedPlanId}
      plans={plans}
      onOpenPlan={async (planCode) => {
        await api.getPlanByCode(planCode);
        navigate('/plans');
        loadPlansAndPrograms();
      }}
    />
  }
/>

// Program management with sub-tabs
<Route
  path="/management"
  element={
    <ProgramManagementPage
      programs={programs}
      onProgramsUpdate={loadPlansAndPrograms}
    />
  }
/>
```

### Wrapper Components

Wrapper components handle sub-tab navigation:

```javascript
// AdvisorCenterPage.jsx
import { useState } from 'react';
import AdvisorCenter from '../components/AdvisorCenter';
import AuditPage from './AuditPage';

export default function AdvisorCenterPage({ selectedPlanId, plans, onOpenPlan }) {
  const [activeSubTab, setActiveSubTab] = useState('plans');
  
  return (
    <div>
      <div className="sub-tab-navigation">
        <button onClick={() => setActiveSubTab('plans')}>Student Plans</button>
        <button onClick={() => setActiveSubTab('audit')}>Degree Audit</button>
      </div>
      {activeSubTab === 'plans' && (
        <AdvisorCenter
          selectedPlanId={selectedPlanId}
          plans={plans}
          onOpenPlan={onOpenPlan}
        />
      )}
      {activeSubTab === 'audit' && <AuditPage />}
    </div>
  );
}
```

### Test the Integration

1. Create a plan with an advisor email (optional field in CreatePlanModal)
2. Log in as that advisor using the advisor authentication system
3. Click the Advisor Center tab in main navigation
4. Verify Student Plans sub-tab is active by default
5. Verify the plan appears in the advisor's dashboard
6. Test search by student name, email, or plan code
7. Test filter by status (draft, active, completed, archived)
8. Test filter by program
9. Test sort functionality (creation date, update date, student name)
10. Click a plan to open it in the Plans view
11. Navigate between Student Plans and Degree Audit sub-tabs

### API Usage

Students link to advisors by providing advisor_email when creating or updating plans:

```javascript
// Create plan with advisor
api.createPlan({
  student_name: "John Doe",
  student_email: "john@example.com",
  advisor_email: "advisor@university.edu",  // Optional
  plan_name: "Spring 2025 Transfer",
  program_id: 1
});

// Update plan advisor
api.updatePlan(planId, {
  advisor_email: "newadvisor@university.edu"
});
```

Advisors access their plans via:

```javascript
// Get all plans for logged-in advisor
api.getAdvisorPlans({
  search: "john",              // Optional: search term
  status: "active",            // Optional: filter by status
  sort: "updated_at",          // Optional: sort field
  order: "desc",               // Optional: sort order
  limit: 20,                   // Optional: results per page
  offset: 0                    // Optional: pagination offset
});

// Get advisor statistics
api.getAdvisorStats();
```


## CSV Data Formats

The system supports CSV uploads for courses, equivalencies, and program requirements. **As of January 2025**, program requirements use a unified CSV format that combines requirements and constraints.

### Unified Program Requirements Format

Program requirements and constraints are now uploaded in a **single CSV file** with optional constraint columns. This eliminates the need for separate uploads and reduces redundancy.

**Key Features:**
- Constraint columns are optional and only filled on the first row of each category
- Course listings follow with empty constraint columns
- Backward compatible with legacy format

**Sample Structure:**
```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,is_preferred,min_credits,max_credits,min_courses,max_courses,min_level,min_courses_at_level,tag_requirement,scope_subject_codes
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"State University",false,10,"",3,"",3000,2,has_lab:true:2,BIOS
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"State University",true,"","","","","","","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 305,"State University",false,"","","","","","","",""
```

**Constraint Types:**
- **Credits**: `min_credits`, `max_credits` - Total credit requirements
- **Courses**: `min_courses`, `max_courses` - Course count requirements
- **Level**: `min_level`, `min_courses_at_level` - Upper-division requirements (e.g., 3000+ level)
- **Tag**: `tag_requirement` - Format "tag:value:count" (e.g., "has_lab:true:2" for 2 lab courses)
- **Scope**: `scope_subject_codes` - Apply constraints to specific subjects only

**Documentation:**
- Full format guide: `docs/UNIFIED_CSV_FORMAT.md`
- Implementation details: `docs/UNIFIED_CSV_IMPLEMENTATION.md`
- Sample file: `docs/equic-csvs/sample-templates/unified_program_requirements.csv`

### Other CSV Formats
- **Courses**: Standard course catalog data (code, title, credits, description, has_lab, course_type)
- **Equivalencies**: Course transfer mappings between institutions


# Course Equivalency Finder App

## What This App will do

This application addresses a fundamental challenge in higher education: determining how courses from one institution transfer to another and how they fulfill specific degree requirements. Students transferring between colleges need to understand not only which of their completed courses will count toward their degree at the new school, but also how those courses satisfy specific program requirements with constraints.

The Course Equivalency Finder serves as a comprehensive system that maps relationships between courses at different institutions and integrates them with detailed program requirements. Students can browse course catalogs, identify transfer equivalencies, track degree completion progress with real-time constraint validation, and create personalized transfer plans that demonstrate exactly how their coursework fulfills degree requirements.

Database Schema

The application uses SQLite with a normalized relational design that models the complete academic structure from institutions down to individual course requirements within degree programs.

**Core Academic Structure:**

The foundational course table includes comprehensive metadata for academic planning:

```python
from . import db
from datetime import datetime

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    credits = db.Column(db.Integer, nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100))
    prerequisites = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    equivalent_from = db.relationship('Equivalency', foreign_keys='Equivalency.from_course_id', backref='from_course')
    equivalent_to = db.relationship('Equivalency', foreign_keys='Equivalency.to_course_id', backref='to_course')
    
    def validate(self):
        errors = []
        if not self.code or len(self.code.strip()) == 0:
            errors.append("Course code is required")
        if not self.title or len(self.title.strip()) == 0:
            errors.append("Course title is required")
        if not self.credits or self.credits <= 0:
            errors.append("Credits must be greater than 0")
        if not self.institution or len(self.institution.strip()) == 0:
            errors.append("Institution is required")
        return errors
```

**Program Structure Tables:**

The system introduces  program modeling that captures degree requirements:

```python
class Program(db.Model):
    __tablename__ = 'programs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    degree_type = db.Column(db.String(50), nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    total_credits_required = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    requirements = db.relationship('ProgramRequirement', backref='program', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'degree_type': self.degree_type,
            'institution': self.institution,
            'total_credits_required': self.total_credits_required,
            'description': self.description,
            'requirements': [req.to_dict() for req in self.requirements]
        }

class ProgramRequirement(db.Model):
    __tablename__ = 'program_requirements'
    
    id = db.Column(db.Integer, primary_key=True)
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    credits_required = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    requirement_type = db.Column(db.String(50), default='simple')
    is_flexible = db.Column(db.Boolean, default=False)
    
    groups = db.relationship('RequirementGroup', backref='requirement', cascade='all, delete-orphan')
    
    def evaluate_completion(self, student_courses):
        if self.requirement_type == 'simple':
            return self._evaluate_simple_requirement(student_courses)
        elif self.requirement_type == 'grouped':
            return self._evaluate_grouped_requirement(student_courses)
        elif self.requirement_type == 'conditional':
            return self._evaluate_conditional_requirement(student_courses)
        else:
            return {'satisfied': False, 'error': 'Unknown requirement type'}
```

**Constraint and Option Management:**

```python
class RequirementGroup(db.Model):
    __tablename__ = 'requirement_groups'
    
    id = db.Column(db.Integer, primary_key=True)
    requirement_id = db.Column(db.Integer, db.ForeignKey('program_requirements.id'), nullable=False)
    group_name = db.Column(db.String(100), nullable=False)
    courses_required = db.Column(db.Integer, nullable=False)
    credits_required = db.Column(db.Integer)
    description = db.Column(db.Text)
    is_required = db.Column(db.Boolean, default=True)
    
    course_options = db.relationship('GroupCourseOption', backref='group', cascade='all, delete-orphan')
    
    def evaluate_completion(self, student_courses):
        option_codes = [opt.course_code for opt in self.course_options]
        
        matching_courses = []
        for course in student_courses:
            if (course.status == 'completed' and 
                course.course.code in option_codes):
                matching_courses.append(course)
        
        if self.courses_required:
            courses_taken = len(matching_courses)
            return {
                'satisfied': courses_taken >= self.courses_required,
                'courses_taken': courses_taken,
                'courses_required': self.courses_required,
                'group_name': self.group_name
            }
        
        return {'satisfied': False, 'error': 'No completion criteria defined'}

class GroupCourseOption(db.Model):
    __tablename__ = 'group_course_options'
    
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('requirement_groups.id'), nullable=False)
    course_code = db.Column(db.String(20), nullable=False)
    institution = db.Column(db.String(100))
    is_preferred = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)
```

**Enhanced Planning Tables:**

```python
class Plan(db.Model):
    __tablename__ = 'plans'
    
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(200), nullable=False)
    student_email = db.Column(db.String(200))
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    plan_name = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='draft')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    courses = db.relationship('PlanCourse', backref='plan', cascade='all, delete-orphan')
    
    def calculate_progress(self):
        total_credits = sum(
            course.credits or course.course.credits or 0 
            for course in self.courses 
            if course.status == 'completed'
        )
        required_credits = self.program.total_credits_required
        
        completed_courses = [course for course in self.courses if course.status == 'completed']
        
        requirement_progress = []
        for requirement in self.program.requirements:
            completed_credits = sum(
                course.credits or course.course.credits or 0
                for course in completed_courses 
                if course.requirement_category == requirement.category
            )
            
            is_complete = completed_credits >= requirement.credits_required
            
            requirement_progress.append({
                'id': requirement.id,
                'category': requirement.category,
                'credits_required': requirement.credits_required,
                'credits_completed': completed_credits,
                'is_complete': is_complete,
                'completion_percentage': (completed_credits / requirement.credits_required * 100) if requirement.credits_required > 0 else 0
            })
        
        return {
            'total_credits_earned': total_credits,
            'total_credits_required': required_credits,
            'completion_percentage': (total_credits / required_credits * 100) if required_credits > 0 else 0,
            'requirement_progress': requirement_progress
        }

class PlanCourse(db.Model):
    __tablename__ = 'plan_courses'
    
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    semester = db.Column(db.String(50))
    year = db.Column(db.Integer)
    status = db.Column(db.String(50), default='planned')
    grade = db.Column(db.String(10))
    credits = db.Column(db.Integer)
    requirement_category = db.Column(db.String(100))
    notes = db.Column(db.Text)
    
    course = db.relationship('Course', backref='plan_courses')
```

## Backend Implementation

The Flask backend provides comprehensive API endpoints with business logic for program analysis and transfer planning.

### Course Management with Advanced Search

```python
from flask import Blueprint, request, jsonify
from models import db, Course
from sqlalchemy import or_

bp = Blueprint('courses', __name__, url_prefix='/api/courses')

@bp.route('', methods=['GET'])
def get_courses():
    search = request.args.get('search', '')
    institution = request.args.get('institution', '')
    department = request.args.get('department', '')
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    
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

@bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course = Course.query.get_or_404(course_id)
    
    equivalencies = []
    for equiv in course.equivalent_from:
        equivalencies.append({
            'type': 'equivalent_to',
            'course': equiv.to_course.to_dict(),
            'equivalency': equiv.to_dict()
        })
    
    for equiv in course.equivalent_to:
        equivalencies.append({
            'type': 'equivalent_from',
            'course': equiv.from_course.to_dict(),
            'equivalency': equiv.to_dict()
        })
    
    return jsonify({
        'course': course.to_dict(),
        'equivalencies': equivalencies
    })
```

### Program Analysis and Requirements

```python
from flask import Blueprint, request, jsonify
from models import db
from models.program import Program, ProgramRequirement, RequirementGroup, GroupCourseOption

bp = Blueprint('programs', __name__, url_prefix='/api/programs')

@bp.route('/<int:program_id>', methods=['GET'])
def get_program(program_id):
    program = Program.query.get_or_404(program_id)
    
    program_data = program.to_dict()
    
    requirements_analysis = []
    for requirement in program.requirements:
        req_data = requirement.to_dict()
        
        if requirement.requirement_type == 'grouped':
            total_options = sum(len(group.course_options) for group in requirement.groups)
            preferred_options = sum(
                len([opt for opt in group.course_options if opt.is_preferred]) 
                for group in requirement.groups
            )
            
            req_data['statistics'] = {
                'total_groups': len(requirement.groups),
                'total_course_options': total_options,
                'preferred_options': preferred_options
            }
        
        requirements_analysis.append(req_data)
    
    program_data['requirements'] = requirements_analysis
    
    return jsonify(program_data)

@bp.route('/<int:program_id>/requirements/<int:requirement_id>/suggestions', methods=['GET'])
def get_requirement_suggestions(program_id, requirement_id):
    requirement = ProgramRequirement.query.filter_by(
        id=requirement_id, 
        program_id=program_id
    ).first_or_404()
    
    suggestions = []
    
    if requirement.requirement_type == 'grouped':
        for group in requirement.groups:
            group_suggestions = []
            for option in group.course_options:
                from models.course import Course
                course = Course.query.filter_by(code=option.course_code).first()
                if course:
                    group_suggestions.append({
                        'course': course.to_dict(),
                        'option_info': option.to_dict(),
                        'group_name': group.group_name
                    })
            
            suggestions.append({
                'group': group.to_dict(),
                'course_options': group_suggestions
            })
    
    return jsonify({
        'requirement': requirement.to_dict(),
        'suggestions': suggestions
    })
```

### Planning with Progress Tracking

```python
from flask import Blueprint, request, jsonify
from models import db, Plan, PlanCourse, Program, Course

bp = Blueprint('plans', __name__, url_prefix='/api/plans')

@bp.route('/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    plan = Plan.query.get_or_404(plan_id)
    
    plan_data = plan.to_dict()
    
    plan_data['progress'] = plan.calculate_progress()
    plan_data['unmet_requirements'] = plan.get_unmet_requirements()
    plan_data['course_suggestions'] = plan.suggest_courses_for_requirements()
    
    return jsonify(plan_data)

@bp.route('/<int:plan_id>/courses', methods=['POST'])
def add_course_to_plan(plan_id):
    plan = Plan.query.get_or_404(plan_id)
    data = request.get_json()
    
    course = Course.query.get(data.get('course_id'))
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    existing = PlanCourse.query.filter_by(
        plan_id=plan_id,
        course_id=data.get('course_id')
    ).first()
    
    if existing:
        return jsonify({'error': 'Course already in plan'}), 400
    
    plan_course = PlanCourse(
        plan_id=plan_id,
        course_id=data.get('course_id'),
        semester=data.get('semester'),
        year=data.get('year'),
        status=data.get('status', 'planned'),
        requirement_category=data.get('requirement_category'),
        notes=data.get('notes', '')
    )
    
    try:
        db.session.add(plan_course)
        db.session.commit()
        return jsonify(plan_course.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add course to plan'}), 500
```

## Advanced Import and Data Processing

The system handles CSV imports that define complete program structures with specific constraint logic:

### CSV Upload with Error Handling

```python
from flask import Blueprint, request, jsonify
import csv
import io
from models import db, Course, Equivalency
from werkzeug.utils import secure_filename

bp = Blueprint('upload', __name__, url_prefix='/api/upload')

@bp.route('/courses', methods=['POST'])
def upload_courses():
    if 'file' not in request.files:
        return jsonify({'error': 'File not Given'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'file not selected'}), 400
    
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        courses_created = 0
        courses_updated = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                code = row.get('code', '').strip()
                title = row.get('title', '').strip()
                
                if not code or not title:
                    errors.append(f"Row {row_num}: Missing required code or title")
                    continue
                
                existing_course = Course.query.filter_by(
                    code=code,
                    institution=row.get('institution', '').strip()
                ).first()
                
                if existing_course:
                    existing_course.title = title
                    existing_course.description = row.get('description', '').strip()
                    existing_course.credits = int(row.get('credits', 0))
                    existing_course.department = row.get('department', '').strip()
                    courses_updated += 1
                else:
                    course = Course(
                        code=code,
                        title=title,
                        description=row.get('description', '').strip(),
                        credits=int(row.get('credits', 0)),
                        institution=row.get('institution', '').strip(),
                        department=row.get('department', '').strip(),
                        prerequisites=row.get('prerequisites', '').strip()
                    )
                    
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

<<<<<<< HEAD
=======
The Course Equivalency Finder demonstrates modern web development practices with emphasis on maintainable code, user experience, and scalable architecture. The program-based enhancement transforms simple course mapping into comprehensive degree planning with real-time progress tracking and constraint validation.
>>>>>>> 385b480 (quick reminder update)
