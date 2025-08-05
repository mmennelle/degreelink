from . import db
from datetime import datetime
from sqlalchemy.sql import func
import json
import secrets
import string

class Plan(db.Model):
    __tablename__ = 'plans'
    
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(200), nullable=False)
    student_email = db.Column(db.String(200))
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    plan_name = db.Column(db.String(200), nullable=False)
    plan_code = db.Column(db.String(8), unique=True, nullable=False, index=True)  # New secure code field
    status = db.Column(db.String(50), default='draft')  
    created_at = db.Column(db.DateTime, server_default=func.now())
    updated_at = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())
    
    courses = db.relationship('PlanCourse', backref='plan', cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        # Generate secure code before calling parent constructor
        super().__init__(**kwargs)
        if not self.plan_code:
            self.plan_code = self.generate_unique_plan_code()
    
    @staticmethod
    def generate_unique_plan_code():
        """Generate a unique 8-character alphanumeric code for plan identification"""
        # Use uppercase letters and digits, excluding confusing characters
        alphabet = string.ascii_uppercase + string.digits
        alphabet = alphabet.replace('0', '').replace('O', '').replace('1', '').replace('I', '')
        
        max_attempts = 100
        for _ in range(max_attempts):
            # Generate 8-character code
            code = ''.join(secrets.choice(alphabet) for _ in range(8))
            
            # Check if code already exists
            if not Plan.query.filter_by(plan_code=code).first():
                return code
        
        # Fallback if all attempts fail (highly unlikely)
        raise Exception("Unable to generate unique plan code after multiple attempts")
    
    @classmethod
    def find_by_code(cls, plan_code):
        """Find a plan by its unique code"""
        if not plan_code or len(plan_code.strip()) != 8:
            return None
        
        return cls.query.filter_by(plan_code=plan_code.upper().strip()).first()
    
    def __repr__(self):
        return f'<Plan {self.plan_name} for {self.student_name} (Code: {self.plan_code})>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_name': self.student_name,
            'student_email': self.student_email,
            'program_id': self.program_id,
            'plan_name': self.plan_name,
            'plan_code': self.plan_code,  # Include the plan code in serialization
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'courses': [course.to_dict() for course in self.courses]
        }
    
    def get_unmet_requirements(self):
        unmet = []
        for requirement in self.program.requirements:
            completed_credits = sum(
                course.credits or course.course.credits or 0
                for course in self.courses 
                if course.status == 'completed' and course.requirement_category == requirement.category
            )
            if completed_credits < requirement.credits_required:
                unmet.append({
                    'category': requirement.category,
                    'credits_needed': requirement.credits_required - completed_credits,
                    'description': requirement.description
                })
        return unmet

    def calculate_progress(self):
        # Defensive: ensure program and requirements exist
        program = getattr(self, 'program', None)
        requirements = getattr(program, 'requirements', []) if program else []
        required_credits = getattr(program, 'total_credits_required', 0) or 0

        total_credits = sum(
            (course.credits or (course.course.credits if course.course else 0) or 0)
            for course in self.courses
            if course.status == 'completed'
        )

        completed_courses = [course for course in self.courses if course.status == 'completed']
        planned_courses = [course for course in self.courses if course.status == 'planned']
        in_progress_courses = [course for course in self.courses if course.status == 'in_progress']

        category_breakdown = {}
        for course in completed_courses:
            category = course.requirement_category or 'Uncategorized'
            if category not in category_breakdown:
                category_breakdown[category] = {
                    'courses': [],
                    'total_credits': 0,
                    'course_count': 0
                }
            course_credits = course.credits or (course.course.credits if course.course else 0) or 0
            category_breakdown[category]['courses'].append({
                'code': course.course.code if course.course else '',
                'title': course.course.title if course.course else '',
                'credits': course_credits,
                'grade': course.grade
            })
            category_breakdown[category]['total_credits'] += course_credits
            category_breakdown[category]['course_count'] += 1

        requirement_progress = []
        total_requirements_met = 0
        for requirement in requirements:
            req_credits_required = getattr(requirement, 'credits_required', 0) or 0
            completed_credits = sum(
                (course.credits or (course.course.credits if course.course else 0) or 0)
                for course in completed_courses
                if course.requirement_category == requirement.category
            )
            is_complete = completed_credits >= req_credits_required
            if is_complete:
                total_requirements_met += 1
            percent = (completed_credits / req_credits_required * 100) if req_credits_required > 0 else 0
            requirement_progress.append({
                'id': getattr(requirement, 'id', None),
                'category': getattr(requirement, 'category', ''),
                'credits_required': req_credits_required,
                'credits_completed': completed_credits,
                'credits_remaining': max(0, req_credits_required - completed_credits),
                'completion_percentage': percent,
                'is_complete': is_complete,
                'description': getattr(requirement, 'description', ''),
                'requirement_type': getattr(requirement, 'requirement_type', '')
            })

        transfer_analysis = self._analyze_transfer_equivalencies(completed_courses)
        gpa_info = self._calculate_gpa(completed_courses)

        # Defensive: avoid division by zero and NaN
        completion_percentage = (total_credits / required_credits * 100) if required_credits > 0 else 0
        requirements_count = len(requirements)
        requirements_completion_percentage = (total_requirements_met / requirements_count * 100) if requirements_count > 0 else 0

        return {
            'total_credits_earned': total_credits,
            'total_credits_required': required_credits,
            'completion_percentage': completion_percentage,
            'remaining_credits': max(0, required_credits - total_credits),
            'category_breakdown': category_breakdown,
            'requirement_progress': requirement_progress,
            'requirements_met': total_requirements_met,
            'total_requirements': requirements_count,
            'requirements_completion_percentage': requirements_completion_percentage,
            'completed_courses_count': len(completed_courses),
            'planned_courses_count': len(planned_courses),
            'in_progress_courses_count': len(in_progress_courses),
            'transfer_analysis': transfer_analysis,
            'gpa_info': gpa_info
        }

    def suggest_courses_for_requirements(self):
        from .course import Course
        from .equivalency import Equivalency
        
        suggestions = []
        completed_course_ids = [course.course_id for course in self.courses if course.status == 'completed']
        unmet_requirements = self.get_unmet_requirements()
        
        for unmet_req in unmet_requirements:
            category = unmet_req['category']
            credits_needed = unmet_req['credits_needed']
            
            program_requirement = next(
                (req for req in self.program.requirements if req.category == category), 
                None
            )
            
            if not program_requirement:
                continue
            
            category_suggestions = {
                'category': category,
                'credits_needed': credits_needed,
                'description': unmet_req.get('description', ''),
                'course_options': []
            }
            
            if program_requirement.requirement_type == 'grouped':
                category_suggestions['course_options'] = self._get_grouped_requirement_suggestions(
                    program_requirement, completed_course_ids
                )
            else:
                category_suggestions['course_options'] = self._get_simple_requirement_suggestions(
                    category, completed_course_ids, credits_needed
                )
            
            if any(course.course.institution for course in self.courses):
                category_suggestions['transfer_options'] = self._get_transfer_suggestions(
                    category_suggestions['course_options']
                )
            
            suggestions.append(category_suggestions)
        
        return suggestions

    def _get_grouped_requirement_suggestions(self, requirement, completed_course_ids):
        from .course import Course
        
        suggestions = []
        
        for group in requirement.groups:
            for course_option in group.course_options:
                course = Course.query.filter_by(
                    code=course_option.course_code,
                    institution=course_option.institution or self.program.institution
                ).first()
                
                if course and course.id not in completed_course_ids:
                    suggestions.append({
                        'id': course.id,
                        'code': course.code,
                        'title': course.title,
                        'credits': course.credits,
                        'institution': course.institution,
                        'description': course.description,
                        'prerequisites': course.prerequisites,
                        'is_preferred': course_option.is_preferred,
                        'group_name': group.group_name,
                        'notes': course_option.notes
                    })
        
        return suggestions

    def _get_simple_requirement_suggestions(self, category, completed_course_ids, credits_needed):
        from .course import Course
        
        category_mappings = {
            'Core Biology': ['Biology', 'Biological Sciences'],
            'Chemistry': ['Chemistry'],
            'Mathematics': ['Mathematics'],
            'Physics': ['Physics'],
            'English Composition': ['English'],
            'Liberal Arts': ['English', 'History', 'Philosophy', 'Art'],
            'Social Sciences': ['Sociology', 'Psychology', 'Political Science'],
            'Humanities': ['English', 'History', 'Philosophy', 'Music', 'Art']
        }
        
        departments = category_mappings.get(category, [category])
        suggestions = []
        
        courses = Course.query.filter(
            Course.institution == self.program.institution,
            Course.department.in_(departments),
            ~Course.id.in_(completed_course_ids)
        ).limit(10).all()
        
        for course in courses:
            suggestions.append({
                'id': course.id,
                'code': course.code,
                'title': course.title,
                'credits': course.credits,
                'institution': course.institution,
                'department': course.department,
                'description': course.description,
                'prerequisites': course.prerequisites,
                'is_preferred': False
            })
        
        return suggestions

    def _get_transfer_suggestions(self, course_options):
        from .equivalency import Equivalency
        
        transfer_options = []
        
        for course_option in course_options:
            equivalencies = Equivalency.query.filter_by(to_course_id=course_option['id']).all()
            
            for equiv in equivalencies:
                if equiv.from_course.institution == 'Delgado Community College':
                    transfer_options.append({
                        'dcc_course': {
                            'id': equiv.from_course.id,
                            'code': equiv.from_course.code,
                            'title': equiv.from_course.title,
                            'credits': equiv.from_course.credits,
                            'description': equiv.from_course.description,
                            'prerequisites': equiv.from_course.prerequisites
                        },
                        'uno_equivalent': {
                            'id': equiv.to_course.id,
                            'code': equiv.to_course.code,
                            'title': equiv.to_course.title,
                            'credits': equiv.to_course.credits
                        },
                        'equivalency_type': equiv.equivalency_type,
                        'notes': equiv.notes
                    })
        
        return transfer_options

    def _analyze_transfer_equivalencies(self, completed_courses):
        from .equivalency import Equivalency
        
        transfer_courses = []
        total_transfer_credits = 0
        
        for course in completed_courses:
            equivalencies = Equivalency.query.filter_by(from_course_id=course.course_id).all()
            
            if equivalencies:
                for equiv in equivalencies:
                    course_credits = course.credits or course.course.credits or 0
                    transfer_courses.append({
                        'from_course': course.course.code,
                        'from_title': course.course.title,
                        'to_course': equiv.to_course.code,
                        'to_title': equiv.to_course.title,
                        'to_institution': equiv.to_course.institution,
                        'credits': course_credits,
                        'equivalency_type': equiv.equivalency_type
                    })
                    total_transfer_credits += course_credits
        
        return {
            'transfer_courses': transfer_courses,
            'total_transfer_credits': total_transfer_credits,
            'transfer_courses_count': len(transfer_courses)
        }

    def _calculate_gpa(self, completed_courses):
        grade_points = {
            'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'D-': 0.7,
            'F': 0.0
        }
        
        total_quality_points = 0
        total_credit_hours = 0
        graded_courses = 0
        
        for course in completed_courses:
            if course.grade and course.grade.upper() in grade_points:
                credits = course.credits or course.course.credits or 0
                points = grade_points[course.grade.upper()]
                total_quality_points += points * credits
                total_credit_hours += credits
                graded_courses += 1
        
        gpa = total_quality_points / total_credit_hours if total_credit_hours > 0 else 0
        
        return {
            'gpa': round(gpa, 2),
            'total_quality_points': total_quality_points,
            'total_credit_hours': total_credit_hours,
            'graded_courses_count': graded_courses
        }

    def get_semester_plan(self):
        semester_plan = {}
        
        for course in self.courses:
            semester_key = f"{course.semester} {course.year}" if course.semester and course.year else "Unscheduled"
            
            if semester_key not in semester_plan:
                semester_plan[semester_key] = {
                    'courses': [],
                    'total_credits': 0,
                    'course_count': 0
                }
            
            course_data = course.to_dict()
            semester_plan[semester_key]['courses'].append(course_data)
            semester_plan[semester_key]['total_credits'] += course.credits or course.course.credits or 0
            semester_plan[semester_key]['course_count'] += 1
        
        return semester_plan

    def validate_prerequisites(self):
        violations = []
        completed_courses = {course.course.code for course in self.courses if course.status == 'completed'}
        
        for plan_course in self.courses:
            if plan_course.status in ['planned', 'in_progress']:
                prerequisites = plan_course.course.prerequisites
                if prerequisites:
                    required_courses = [prereq.strip() for prereq in prerequisites.split(',')]
                    missing_prereqs = [req for req in required_courses if req and req not in completed_courses]
                    
                    if missing_prereqs:
                        violations.append({
                            'course': plan_course.course.code,
                            'title': plan_course.course.title,
                            'missing_prerequisites': missing_prereqs,
                            'semester': plan_course.semester,
                            'year': plan_course.year
                        })
        
        return violations

class PlanCourse(db.Model):
    __tablename__ = 'plan_courses'
    __table_args__ = {'extend_existing': True}
    
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
    
    def to_dict(self):
        return {
            'id': self.id,
            'plan_id': self.plan_id,
            'course_id': self.course_id,
            'course': self.course.to_dict() if self.course else None,
            'semester': self.semester,
            'year': self.year,
            'status': self.status,
            'grade': self.grade,
            'credits': self.credits or (self.course.credits if self.course else 0),
            'requirement_category': self.requirement_category,
            'notes': self.notes
        }