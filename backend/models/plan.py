from . import db
from datetime import datetime
from sqlalchemy.sql import func
from .course import Course
from .equivalency import Equivalency
#from .program import Program
import json
import secrets
import string

class Plan(db.Model):
    __tablename__ = 'plans'
    
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(200), nullable=False)
    student_email = db.Column(db.String(200))
    
    # Target program (where student wants to transfer to)
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    
    # Current program (where student is currently enrolled) - ADDED
    current_program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=True)
    
    plan_name = db.Column(db.String(200), nullable=False)
    plan_code = db.Column(db.String(8), unique=True, nullable=False, index=True)
    status = db.Column(db.String(50), default='draft')  
    created_at = db.Column(db.DateTime, server_default=func.now())
    updated_at = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())
    
    courses = db.relationship('PlanCourse', backref='plan', cascade='all, delete-orphan')
    
    # Relationships for both programs
    target_program = db.relationship('Program', foreign_keys=[program_id], backref='target_plans')
    current_program = db.relationship('Program', foreign_keys=[current_program_id], backref='current_plans')
    
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
        
        # Sanitize the input
        clean_code = ''.join(c for c in plan_code.upper().strip() if c.isalnum())
        if len(clean_code) != 8:
            return None
            
        return cls.query.filter_by(plan_code=clean_code).first()
    
    def __repr__(self):
        return f'<Plan {self.plan_name} for {self.student_name} (Code: {self.plan_code})>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_name': self.student_name,
            'student_email': self.student_email,
            'program_id': self.program_id,
            'current_program_id': self.current_program_id,  
            'plan_name': self.plan_name,
            'plan_code': self.plan_code,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'courses': [course.to_dict() for course in self.courses],
            'target_program': self.target_program.to_dict() if self.target_program else None,  
            'current_program': self.current_program.to_dict() if self.current_program else None  
        }
    
    @staticmethod
    def normalize_category(category):
        """Normalize category names to handle variations"""
        if not category:
            return 'Uncategorized'
        
        category_lower = category.lower().strip()
        
        # Map variations to standard names
        mappings = {
            'math/analytical reasoning': 'Mathematics',
            'mathematical reasoning': 'Mathematics',
            'math': 'Mathematics',
            'mathematics': 'Mathematics',
            'english composition': 'English',
            'composition': 'English',
            'english': 'English',
            'science': 'Science',
            'sciences': 'Science',
            'biology': 'Science',
            'chemistry': 'Science',
            'physics': 'Physics',
            'physical science': 'Physics',
            'humanities': 'Humanities',
            'social sciences': 'Social Sciences',
            'social science': 'Social Sciences',
            'arts': 'Arts',
            'fine arts': 'Arts'
        }
        
        return mappings.get(category_lower, category)

    
    def calculate_progress(self, program=None, view_filter='All Courses'):
        """
        If `program` is None, return progress for both current and target programs.
        If `program` is provided, return progress for that single program.
        """
        def canon(s):
            # Fallback to normalize_category if you have one
            try:
                return self.normalize_category(s)
            except Exception:
                import re
                s = (s or '').lower()
                s = re.sub(r'\W+', ' ', s).strip()
                return s

        def status_key(s):
            label = (s or '').strip().lower()
            # All Courses shows everything
            if label in ('', 'all', 'all courses', 'all-courses'):
                return None
            # Map common UI labels to internal status values
            mapping = {
                'completed courses': 'completed',
                'completed': 'completed',
                'in progress': 'in_progress',
                'in-progress': 'in_progress',
                'planned': 'planned',
            }
            return mapping.get(label, None)

        # Overview: compute both current and transfer progress
        if program is None:
            return {
                'current': self.calculate_progress(self.current_program, view_filter)
                        if self.current_program else {
                            'percent': 0,
                            'requirements': [],
                            'total_credits_earned': 0,
                            'total_credits_required': 0,
                        },
                'transfer': self.calculate_progress(self.target_program, view_filter)
                            if self.target_program else {
                                'percent': 0,
                                'requirements': [],
                                'total_credits_earned': 0,
                                'total_credits_required': 0,
                            },
            }

        # Single-program mode
        prog_id = getattr(program, 'id', None)
        prog_institution = getattr(program, 'institution', None)
        status_filter = status_key(view_filter)

        # Filter plan courses by status and relevance
        relevant_courses = []
        for pc in self.courses or []:
            if status_filter and (pc.status or '').lower() != status_filter:
                continue
            try:
                is_relevant = self._is_course_relevant_to_program(pc, program)
            except Exception:
                is_relevant = True
            if is_relevant:
                relevant_courses.append(pc)

        requirements_data = []
        for req in program.requirements or []:
            req_total = getattr(req, 'credits_required', 0) or 0
            completed = 0
            applied = []

            req_canon = canon(getattr(req, 'category', ''))
            group_ids = []
            if getattr(req, 'requirement_type', '') == 'grouped':
                try:
                    group_ids = [g.id for g in (req.groups or [])]
                except Exception:
                    group_ids = []

            # If feature flag is enabled and this is a grouped requirement, use the stricter evaluator
            use_group_eval = False
            try:
                from config import Config as _Cfg
                use_group_eval = _Cfg.PROGRESS_USE_GROUPED_EVALUATION and getattr(req, 'requirement_type', '') == 'grouped'
            except Exception:
                use_group_eval = False

            # Preserve legacy behavior for the "All Courses" view so planned/in_progress
            # contributions still show anticipated progress. Only enforce strict grouped
            # evaluation when a specific status filter is applied (e.g., Completed Courses).
            if use_group_eval:
                try:
                    sf = status_key(view_filter)
                    if sf is None:  # All Courses view
                        use_group_eval = False
                except Exception:
                    pass

            if use_group_eval:
                try:
                    eval_result = req.evaluate_completion([pc for pc in relevant_courses])
                except Exception:
                    eval_result = None

                # Fallback to 0 if evaluator fails
                total_earned = int((eval_result or {}).get('credits_earned') or 0)
                clamped = min(total_earned, req_total) if req_total else total_earned
                req_status = 'met' if ((eval_result or {}).get('satisfied') or (req_total and clamped >= req_total)) else ('part' if clamped > 0 else 'none')

                # Derive courses_used from group_results if provided
                applied = []
                group_results = (eval_result or {}).get('group_results') or []
                for gr in group_results:
                    for c in gr.get('courses_used') or []:
                        # c may already be dicts from PlanCourse.to_dict()
                        applied.append(c)

                requirements_data.append({
                    'id': getattr(req, 'id', None),
                    'name': getattr(req, 'category', ''),
                    'category': getattr(req, 'category', ''),
                    'status': req_status,
                    'completedCredits': clamped,
                    'totalCredits': req_total,
                    'courses': applied,
                    'description': getattr(req, 'description', ''),
                    'requirement_type': getattr(req, 'requirement_type', ''),
                    # Non-breaking extras
                    'group_results': group_results,
                })
                continue

            # Legacy/simple path or when grouped evaluation is disabled
            # Pre-compute allowed option codes for grouped requirements (normalized)
            allowed_codes = set()
            if getattr(req, 'requirement_type', '') == 'grouped':
                try:
                    for g in (req.groups or []):
                        for opt in (g.course_options or []):
                            code_norm = (getattr(opt, 'course_code', '') or '').upper().replace('-', ' ').strip()
                            if code_norm:
                                allowed_codes.add(code_norm)
                except Exception:
                    allowed_codes = set()

            for pc in relevant_courses:
                course_canon = canon(getattr(pc, 'requirement_category', ''))
                cat_match = (course_canon == req_canon)
                group_match = (group_ids and getattr(pc, 'requirement_group_id', None) in group_ids)

                # For target program in legacy path: if grouped requirement and no direct group assignment,
                # allow equivalency-driven match when the equivalent target course code appears in group options.
                if not group_match and allowed_codes and prog_id == getattr(self, 'program_id', None):
                    try:
                        eq_course = self._get_equivalent_course(pc, program)
                        if eq_course:
                            eq_code_norm = (eq_course.code or '').upper().replace('-', ' ').strip()
                            if eq_code_norm in allowed_codes:
                                group_match = True
                    except Exception:
                        pass
                    # Also consider direct target-institution courses whose own code appears in group options
                    if not group_match and getattr(pc, 'course', None) and getattr(pc.course, 'institution', None) == program.institution:
                        try:
                            own_code_norm = (pc.course.code or '').upper().replace('-', ' ').strip()
                            if own_code_norm in allowed_codes:
                                group_match = True
                        except Exception:
                            pass
                if not (cat_match or group_match):
                    continue

                credits = (pc.credits
                        or (pc.course.credits if pc.course else 0)
                        or 0)
                completed += credits
                ci = {
                    'id': pc.course.id if pc.course else None,
                    'code': pc.course.code if pc.course else '',
                    'title': pc.course.title if pc.course else '',
                    'credits': credits,
                    'status': pc.status,
                    'grade': pc.grade,
                }
                if prog_id == getattr(self, 'program_id', None):
                    try:
                        eq = self._get_equivalent_course(pc, program)
                        if eq:
                            ci['equivalent_code'] = eq.code
                            ci['equivalent_title'] = eq.title
                    except Exception:
                        pass
                applied.append(ci)

            clamped = min(completed, req_total)
            req_status = ('met' if (req_total > 0 and clamped >= req_total) else
                        ('part' if clamped > 0 else 'none'))
            requirements_data.append({
                'id': getattr(req, 'id', None),
                'name': getattr(req, 'category', ''),
                'category': getattr(req, 'category', ''),
                'status': req_status,
                'completedCredits': clamped,
                'totalCredits': req_total,
                'courses': applied,
                'description': getattr(req, 'description', ''),
                'requirement_type': getattr(req, 'requirement_type', ''),
            })

        total_required = sum(r['totalCredits'] for r in requirements_data)
        total_earned = sum(r['completedCredits'] for r in requirements_data)
        percent = (total_earned / total_required * 100) if total_required else 0

        return {
            'program_id': prog_id,
            'institution': prog_institution,
            'view': view_filter,
            'percent': percent,
            'requirements': requirements_data,
            'total_credits_earned': total_earned,
            'total_credits_required': total_required,
        }


    
    def _is_course_relevant_to_program(self, plan_course, program):
        """Check if a course is relevant to a specific program"""
        if not plan_course.course or not program:
            return False
        
        course_institution = plan_course.course.institution
        program_institution = program.institution
        
        # Direct institution match
        if course_institution == program_institution:
            return True
        
        # Check for equivalency if this is the target program
        if program.id == self.program_id:  # Target program
            equiv_course = self._get_equivalent_course(plan_course, program)
            return equiv_course is not None
        
        return False
    
    def _get_equivalent_course(self, plan_course, target_program):
        """Get the equivalent course at the target program"""
        from .equivalency import Equivalency
        from .course import Course
        
        if not plan_course.course:
            return None

        # Prefer an equivalency that maps specifically to the target institution.
        try:
            # Join to the Course table for the target (to_course) to filter by institution.
            to_alias = Course
            eq = (Equivalency.query
                  .join(to_alias, Equivalency.to_course_id == to_alias.id)
                  .filter(
                      Equivalency.from_course_id == plan_course.course.id,
                      to_alias.institution == target_program.institution
                  )
                  .first())
            if eq and eq.to_course:
                return eq.to_course
        except Exception:
            pass

        # Fallback: return None (either no mapping to target institution, or only 'no equivalent')
        return None
    
    def get_unmet_requirements(self):
        unmet = []
        if not self.target_program:
            return unmet
            
        canon = self.normalize_category
        # Compare plan's completed credits against the TARGET program's requirements
        for requirement in (self.target_program.requirements or []):
            completed_credits = sum(
                (pc.credits or (pc.course.credits if pc.course else 0) or 0)
                for pc in self.courses
                if pc.status == 'completed'
                and canon(getattr(pc, 'requirement_category', '')) == canon(requirement.category)
            )
            if completed_credits < requirement.credits_required:
                unmet.append({
                    'category': requirement.category,
                    'credits_needed': requirement.credits_required - completed_credits,
                    'description': requirement.description
                })
        return unmet


    def suggest_courses_for_requirements(self):
        suggestions = []
        # Exclude any course already on the plan (planned, in_progress, completed)
        excluded_course_ids = [course.course_id for course in (self.courses or [])]
        unmet_requirements = self.get_unmet_requirements()

        for unmet_req in unmet_requirements:
            category = unmet_req['category']
            credits_needed = unmet_req['credits_needed']
            
            program_requirement = next(
                (req for req in self.target_program.requirements if req.category == category), 
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
                    program_requirement, excluded_course_ids
                )
            else:
                # Only propose courses that would actually count for this requirement
                category_suggestions['course_options'] = self._get_simple_requirement_suggestions(
                    category, excluded_course_ids, credits_needed, program_requirement
                )
            
            if any(course.course and course.course.institution for course in (self.courses or [])):
                category_suggestions['transfer_options'] = self._get_transfer_suggestions(
                    category_suggestions['course_options']
                )
            
            suggestions.append(category_suggestions)
        
        return suggestions

    def _get_grouped_requirement_suggestions(self, requirement, excluded_course_ids):
        from .course import Course
        
        suggestions = []
        
        for group in requirement.groups:
            for course_option in group.course_options:
                course = Course.query.filter_by(
                    code=course_option.course_code,
                    institution=course_option.institution or self.target_program.institution
                ).first()
                
                if course and course.id not in excluded_course_ids:
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

    def _get_simple_requirement_suggestions(self, category, excluded_course_ids, credits_needed, program_requirement=None):
        """Suggest only courses at the target institution that would satisfy the given simple requirement.

        This uses subject-code based mappings rather than broad department matches, and excludes
        courses already completed in the plan. If a mapping isn't found, it falls back to the
        requirement's category as a conservative filter on department name.
        """
        from .course import Course

        # Centralised subject mappings for common requirement categories
        subject_mappings = {
            'english composition': ['ENGL', 'ENG'],
            'composition': ['ENGL', 'ENG'],
            'english': ['ENGL', 'ENG'],
            'literature': ['ENGL', 'LIT'],
            'mathematics': ['MATH', 'STAT'],
            'math': ['MATH', 'STAT'],
            'analytical reasoning': ['MATH', 'STAT', 'PHIL'],
            'reasoning': ['PHIL', 'MATH'],
            'biology': ['BIOL', 'BIO'],
            'chemistry': ['CHEM'],
            'physics': ['PHYS'],
            'history': ['HIST'],
            'science': ['BIOL', 'CHEM', 'PHYS'],
            'social sciences': ['SOC', 'PSY', 'POLI'],
            'social science': ['SOC', 'PSY', 'POLI'],
            'humanities': ['ENGL', 'HIST', 'PHIL', 'ART', 'MUSC', 'THEA'],
            'arts': ['ART', 'MUSC', 'THEA'],
            'fine arts': ['ART', 'MUSC', 'THEA'],
            'liberal arts': ['ENGL', 'HIST', 'PHIL', 'ART', 'MUSC', 'THEA', 'SOC', 'PSY', 'POLI'],
        }

        norm = (category or '').strip().lower()
        subjects = subject_mappings.get(norm, [])

        query = Course.query.filter(
            Course.institution == self.target_program.institution,
            ~Course.id.in_(excluded_course_ids)
        )
        if subjects:
            query = query.filter(Course.subject_code.in_(subjects))
        else:
            # Fallback: filter by department string containing the category
            if norm:
                query = query.filter(Course.department.ilike(f"%{category}%"))

        # Pull a modest set; we'll validate each against the requirement
        # Exclude developmental or non-credit-bearing courses (below 1000 level) when possible
        try:
            candidates = query.filter(
                ((Course.course_level == None) | (Course.course_level >= 1000)) &
                ((Course.course_number_numeric == None) | (Course.course_number_numeric >= 100))
            ).limit(30).all()
        except Exception:
            candidates = query.limit(30).all()

        valid = []
        for course in candidates:
            if self._will_course_satisfy_requirement(course, program_requirement, category_hint=category):
                valid.append({
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

        # Sort by subject/course number for stable ordering; trim to roughly credits_needed scope
        # We can't ensure exact credit matching here; leave selection to the user with clear options
        return valid[:12]

    def _will_course_satisfy_requirement(self, course, requirement, category_hint: str | None = None) -> bool:
        """Return True if the candidate course would count toward the requirement.

        Grouped requirements: course code must appear in at least one group's options (respecting
        institution if provided).

        Simple requirements: accept courses whose subject_code is in a mapped set for the category
        (or whose department contains the category as a fallback). If requirement is None, use the
        category_hint.
        """
        from .program import ProgramRequirement
        if not course:
            return False

        if isinstance(requirement, ProgramRequirement) and requirement.requirement_type == 'grouped':
            # Check if the course code appears in any allowed option in any group
            for group in requirement.groups or []:
                for opt in group.course_options or []:
                    inst_ok = (not opt.institution) or (opt.institution == course.institution)
                    if inst_ok and (opt.course_code or '').strip().upper() == (course.code or '').strip().upper():
                        return True
            return False

        # Simple requirement validation by subject mapping
        category = (requirement.category if isinstance(requirement, ProgramRequirement) else category_hint) or ''
        norm = category.strip().lower()
        subject_mappings = {
            'english composition': ['ENGL', 'ENG'],
            'composition': ['ENGL', 'ENG'],
            'english': ['ENGL', 'ENG'],
            'literature': ['ENGL', 'LIT'],
            'mathematics': ['MATH', 'STAT'],
            'math': ['MATH', 'STAT'],
            'analytical reasoning': ['MATH', 'STAT', 'PHIL'],
            'reasoning': ['PHIL', 'MATH'],
            'biology': ['BIOL', 'BIO'],
            'chemistry': ['CHEM'],
            'physics': ['PHYS'],
            'history': ['HIST'],
            'science': ['BIOL', 'CHEM', 'PHYS'],
            'social sciences': ['SOC', 'PSY', 'POLI'],
            'social science': ['SOC', 'PSY', 'POLI'],
            'humanities': ['ENGL', 'HIST', 'PHIL', 'ART', 'MUSC', 'THEA'],
            'arts': ['ART', 'MUSC', 'THEA'],
            'fine arts': ['ART', 'MUSC', 'THEA'],
            'liberal arts': ['ENGL', 'HIST', 'PHIL', 'ART', 'MUSC', 'THEA', 'SOC', 'PSY', 'POLI'],
        }
        subjects = subject_mappings.get(norm, [])
        if subjects:
            return (course.subject_code or '').upper() in subjects and course.institution == self.target_program.institution
        # Fallback to department contains category keyword
        if norm:
            dept = (course.department or '').lower()
            return (norm in dept) and course.institution == self.target_program.institution
        return False

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
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False, index=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False, index=True)
    semester = db.Column(db.String(50))  
    year = db.Column(db.Integer)
    status = db.Column(db.String(50), default='planned', index=True)  
    grade = db.Column(db.String(10))
    credits = db.Column(db.Integer)  
    requirement_category = db.Column(db.String(100), index=True)  
    requirement_group_id = db.Column(db.Integer, db.ForeignKey('requirement_groups.id'), nullable=True, index=True)  
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
            'requirement_group_id': self.requirement_group_id,  
            'notes': self.notes
        }