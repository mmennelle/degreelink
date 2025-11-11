"""RequirementConstraint model for Phase 2 constraint evaluation.

This model stores advanced constraints that apply to grouped requirements,
such as level-based credit requirements, course type counts, and credit caps.
"""
from . import db
from datetime import datetime
import json


class RequirementConstraint(db.Model):
    """Advanced constraints for requirement evaluation.
    
    Example constraints:
    - "At least 10 credits at 3000+ level"
    - "Minimum 2 lab courses"
    - "Maximum 7 credits of research courses"
    - "At least 3 courses at 4000 level"
    """
    __tablename__ = 'requirement_constraints'
    
    id = db.Column(db.Integer, primary_key=True)
    requirement_id = db.Column(db.Integer, db.ForeignKey('program_requirements.id'), nullable=False, index=True)
    
    # Constraint type determines how params are interpreted
    constraint_type = db.Column(db.String(50), nullable=False, index=True)
    # Valid types: 'min_level_credits', 'min_tag_courses', 'max_tag_credits', 
    #              'min_courses_at_level', 'same_sequence', 'min_grade', 'substitution_set'
    
    # Flexible JSON params for constraint-specific data
    # Examples:
    #   min_level_credits: {"level_min": 3000, "credits": 10}
    #   min_tag_courses: {"tag": "lab", "courses": 2}
    #   max_tag_credits: {"tag": "research", "credits": 7}
    #   min_courses_at_level: {"level": 4000, "courses": 3}
    params = db.Column(db.Text, nullable=False)  # Stored as JSON string
    
    # Optional scope filter - applies constraint to subset of courses
    # Example: {"subject_code": "BIOS"} - only apply to BIOS courses
    scope_filter = db.Column(db.Text)  # Stored as JSON string, nullable
    
    # Human-readable description for UI
    description = db.Column(db.Text)
    
    # Priority for constraint evaluation order (lower = higher priority)
    priority = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship back to requirement
    requirement = db.relationship('ProgramRequirement', back_populates='constraints')
    
    def __repr__(self):
        return f'<RequirementConstraint {self.constraint_type} for req {self.requirement_id}>'
    
    def get_params(self):
        """Parse params JSON into dict."""
        try:
            return json.loads(self.params) if self.params else {}
        except (json.JSONDecodeError, TypeError):
            return {}
    
    def set_params(self, params_dict):
        """Set params from dict."""
        self.params = json.dumps(params_dict) if params_dict else '{}'
    
    def get_scope_filter(self):
        """Parse scope_filter JSON into dict."""
        try:
            return json.loads(self.scope_filter) if self.scope_filter else {}
        except (json.JSONDecodeError, TypeError):
            return {}
    
    def set_scope_filter(self, scope_dict):
        """Set scope_filter from dict."""
        self.scope_filter = json.dumps(scope_dict) if scope_dict else None
    
    def to_dict(self):
        """Serialize to dictionary."""
        return {
            'id': self.id,
            'requirement_id': self.requirement_id,
            'constraint_type': self.constraint_type,
            'params': self.get_params(),
            'scope_filter': self.get_scope_filter(),
            'description': self.description,
            'priority': self.priority,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def evaluate(self, courses):
        """Evaluate this constraint against a list of PlanCourse objects.
        
        Args:
            courses: List of PlanCourse objects with their associated Course data
            
        Returns:
            dict with keys:
                - satisfied: bool
                - reason: str (if not satisfied)
                - tally: dict with relevant counts/totals
        """
        constraint_type = self.constraint_type
        params = self.get_params()
        scope = self.get_scope_filter()
        
        # Apply scope filter if present
        scoped_courses = self._apply_scope_filter(courses, scope)
        
        # Delegate to specific evaluator
        if constraint_type == 'min_level_credits':
            return self._evaluate_min_level_credits(scoped_courses, params)
        elif constraint_type == 'min_tag_courses':
            return self._evaluate_min_tag_courses(scoped_courses, params)
        elif constraint_type == 'max_tag_credits':
            return self._evaluate_max_tag_credits(scoped_courses, params)
        elif constraint_type == 'min_courses_at_level':
            return self._evaluate_min_courses_at_level(scoped_courses, params)
        else:
            return {
                'satisfied': True,
                'reason': f'Unknown constraint type: {constraint_type}',
                'tally': {}
            }
    
    def _apply_scope_filter(self, courses, scope):
        """Filter courses based on scope_filter criteria."""
        if not scope:
            return courses
        
        filtered = []
        for pc in courses:
            course = pc.course if hasattr(pc, 'course') else None
            if not course:
                continue
            
            # Check each scope criterion
            match = True
            if 'subject_code' in scope:
                if course.subject_code != scope['subject_code']:
                    match = False
            if 'level_min' in scope:
                if not course.course_level or course.course_level < scope['level_min']:
                    match = False
            if 'level_max' in scope:
                if not course.course_level or course.course_level > scope['level_max']:
                    match = False
            
            if match:
                filtered.append(pc)
        
        return filtered
    
    def _evaluate_min_level_credits(self, courses, params):
        """Evaluate: At least X credits at Y level or above."""
        level_min = params.get('level_min', 0)
        credits_required = params.get('credits', 0)
        
        credits_earned = 0
        for pc in courses:
            course = pc.course if hasattr(pc, 'course') else None
            if course and course.course_level and course.course_level >= level_min:
                credits_earned += (pc.credits or course.credits or 0)
        
        return {
            'satisfied': credits_earned >= credits_required,
            'reason': f'Need {credits_required}cr at {level_min}+ level, have {credits_earned}cr' if credits_earned < credits_required else None,
            'tally': {
                f'credits_{level_min}_plus': credits_earned,
                f'credits_{level_min}_plus_required': credits_required
            }
        }
    
    def _evaluate_min_tag_courses(self, courses, params):
        """Evaluate: At least X courses with tag Y."""
        tag = params.get('tag', '')  # e.g., 'lab', 'research'
        courses_required = params.get('courses', 0)
        
        matching_courses = 0
        for pc in courses:
            course = pc.course if hasattr(pc, 'course') else None
            if not course:
                continue
            
            # Check based on tag type
            if tag == 'lab' and course.has_lab:
                matching_courses += 1
            elif tag in ['research', 'seminar', 'independent_study'] and course.course_type == tag:
                matching_courses += 1
        
        return {
            'satisfied': matching_courses >= courses_required,
            'reason': f'Need {courses_required} {tag} courses, have {matching_courses}' if matching_courses < courses_required else None,
            'tally': {
                f'{tag}_courses': matching_courses,
                f'{tag}_courses_required': courses_required
            }
        }
    
    def _evaluate_max_tag_credits(self, courses, params):
        """Evaluate: At most X credits of tag Y."""
        tag = params.get('tag', '')
        credits_max = params.get('credits', 999)
        
        credits_earned = 0
        for pc in courses:
            course = pc.course if hasattr(pc, 'course') else None
            if not course:
                continue
            
            # Check based on tag type
            if tag == 'research' and course.course_type in ['research', 'seminar', 'independent_study']:
                credits_earned += (pc.credits or course.credits or 0)
            elif tag == course.course_type:
                credits_earned += (pc.credits or course.credits or 0)
        
        return {
            'satisfied': credits_earned <= credits_max,
            'reason': f'Maximum {credits_max}cr of {tag}, have {credits_earned}cr' if credits_earned > credits_max else None,
            'tally': {
                f'{tag}_credits': credits_earned,
                f'{tag}_credits_max': credits_max
            }
        }
    
    def _evaluate_min_courses_at_level(self, courses, params):
        """Evaluate: At least X courses at specific level."""
        level = params.get('level', 0)
        courses_required = params.get('courses', 0)
        
        matching_courses = 0
        for pc in courses:
            course = pc.course if hasattr(pc, 'course') else None
            if course and course.course_level == level:
                matching_courses += 1
        
        return {
            'satisfied': matching_courses >= courses_required,
            'reason': f'Need {courses_required} courses at {level} level, have {matching_courses}' if matching_courses < courses_required else None,
            'tally': {
                f'courses_at_{level}': matching_courses,
                f'courses_at_{level}_required': courses_required
            }
        }
