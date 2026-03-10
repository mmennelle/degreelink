"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

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
        if constraint_type == 'credits':
            return self._evaluate_credits(scoped_courses, params)
        elif constraint_type == 'min_level_credits':
            return self._evaluate_min_level_credits(scoped_courses, params)
        elif constraint_type == 'min_tag_courses':
            return self._evaluate_min_tag_courses(scoped_courses, params)
        elif constraint_type == 'max_tag_credits':
            return self._evaluate_max_tag_credits(scoped_courses, params)
        elif constraint_type == 'min_courses_at_level':
            return self._evaluate_min_courses_at_level(scoped_courses, params)
        elif constraint_type == 'courses':
            return self._evaluate_course_count(scoped_courses, params)
        else:
            return {
                'satisfied': True,
                'reason': f'Unknown constraint type: {constraint_type}',
                'tally': {}
            }
    
    def _evaluate_credits(self, courses, params):
        """Evaluate: Total credits within min/max bounds."""
        credits_min = params.get('credits_min')
        credits_max = params.get('credits_max')
        
        total_credits = 0
        for pc in courses:
            course = pc.course if hasattr(pc, 'course') else None
            if course:
                total_credits += (pc.credits or course.credits or 0)
        
        satisfied = True
        reasons = []
        if credits_min is not None and total_credits < credits_min:
            satisfied = False
            reasons.append(f'Need {credits_min}cr, have {total_credits}cr')
        if credits_max is not None and total_credits > credits_max:
            satisfied = False
            reasons.append(f'Maximum {credits_max}cr allowed, have {total_credits}cr')
        
        tally = {'credits_earned': total_credits}
        if credits_min is not None:
            tally['credits_required'] = credits_min
        if credits_max is not None:
            tally['credits_max'] = credits_max
        
        return {
            'satisfied': satisfied,
            'reason': '; '.join(reasons) if reasons else None,
            'tally': tally
        }
    
    def _evaluate_course_count(self, courses, params):
        """Evaluate: Total course count within min/max bounds."""
        courses_min = params.get('courses_min')
        courses_max = params.get('courses_max')
        
        total_courses = len(courses)
        
        satisfied = True
        reasons = []
        if courses_min is not None and total_courses < courses_min:
            satisfied = False
            reasons.append(f'Need {courses_min} courses, have {total_courses}')
        if courses_max is not None and total_courses > courses_max:
            satisfied = False
            reasons.append(f'Maximum {courses_max} courses allowed, have {total_courses}')
        
        tally = {'courses_earned': total_courses}
        if courses_min is not None:
            tally['courses_required'] = courses_min
        if courses_max is not None:
            tally['courses_max'] = courses_max
        
        return {
            'satisfied': satisfied,
            'reason': '; '.join(reasons) if reasons else None,
            'tally': tally
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
            
            # Group name filtering (for group-level constraints)
            if 'group_name' in scope:
                pc_group_name = getattr(pc, '_resolved_group_name', None)
                # Fallback: resolve from requirement_group_id
                if pc_group_name is None and getattr(pc, 'requirement_group_id', None):
                    try:
                        from .program import RequirementGroup
                        grp = RequirementGroup.query.get(pc.requirement_group_id)
                        if grp:
                            pc_group_name = grp.group_name
                    except Exception:
                        pass
                if pc_group_name != scope['group_name']:
                    match = False
            
            # Subject code filtering
            if 'subject_code' in scope:
                if course.subject_code != scope['subject_code']:
                    match = False
            
            # Subject codes list filtering (for multiple subjects)
            if 'subject_codes' in scope:
                if course.subject_code not in scope['subject_codes']:
                    match = False
            
            # Level range filtering
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
        """Evaluate: At least X courses at or above a specific level."""
        level = params.get('level', 0)
        courses_required = params.get('courses', 1)
        
        matching_courses = 0
        for pc in courses:
            course = pc.course if hasattr(pc, 'course') else None
            if course and course.course_level >= level:
                matching_courses += 1
        
        return {
            'satisfied': matching_courses >= courses_required,
            'reason': f'Need {courses_required} courses at {level}+ level, have {matching_courses}' if matching_courses < courses_required else None,
            'tally': {
                f'courses_at_{level}+': matching_courses,
                f'courses_at_{level}+_required': courses_required
            }
        }
