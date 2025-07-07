# Backend Tester Usage

## Steps

1. Initialize database: `python init_db.py`
2. Start Flask backend: `python app.py`
3. Run an API tester
   1. use postman or burpsuite ETC
   2. Open `backend-tester.html` in web browser
4. Verify connection test shows green success message
5. Test endpoints in order:
  - Basic Data (institutions, departments, courses)
  - Programs (create, analyze)
  - Transfer Plans (create, retrieve)
  - CSV Import
6. Check JSON responses for expected data structure
7. Some data is uploaded to db on init but you can also add the CSV files in docs/equic-csvs via the import endpoints for more test data

## Quick Test Sequence

1. GET /institutions
2. GET /departments (use institution ID from step 1)
3. GET /courses (use department ID from step 2)
4. POST /programs (create test program)
5. POST /create-plan (create test transfer plan)
6. GET /get-plan/{code} (retrieve plan using code from step 5)



# Course Equivalency Finder App

## What This App will do

This application addresses a fundamental challenge in higher education: determining how courses from one institution transfer to another and how they fulfill specific degree requirements. Students transferring between colleges need to understand not only which of their completed courses will count toward their degree at the new school, but also how those courses satisfy specific program requirements with complex constraints.

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

The system introduces sophisticated program modeling that captures complex degree requirements:

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

The Flask backend provides comprehensive API endpoints with sophisticated business logic for program analysis and transfer planning.

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

