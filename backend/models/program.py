from . import db
from datetime import datetime
import json
from .plan import PlanCourse

class Program(db.Model):
    __tablename__ = 'programs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    degree_type = db.Column(db.String(50), nullable=False)  # BA, BS, AA, etc.
    institution = db.Column(db.String(100), nullable=False)
    total_credits_required = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    requirements = db.relationship('ProgramRequirement', backref='program', cascade='all, delete-orphan')
    plans = db.relationship('Plan', backref='program')
    
    def __repr__(self):
        return f'<Program {self.name} ({self.degree_type})>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'degree_type': self.degree_type,
            'institution': self.institution,
            'total_credits_required': self.total_credits_required,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'requirements': [req.to_dict() for req in self.requirements]
        }

class ProgramRequirement(db.Model):
    __tablename__ = 'program_requirements'
    
    id = db.Column(db.Integer, primary_key=True)
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    category = db.Column(db.String(100), nullable=False)  # Core, Elective, Gen Ed, etc.
    credits_required = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    requirement_type = db.Column(db.String(50), default='simple')  # simple, grouped, conditional
    is_flexible = db.Column(db.Boolean, default=False)  # Can be satisfied by multiple paths
    priority_order = db.Column(db.Integer, default=0)  # Display/evaluation order
    
    # Relationships
    groups = db.relationship('RequirementGroup', backref='requirement', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'program_id': self.program_id,
            'category': self.category,
            'credits_required': self.credits_required,
            'description': self.description,
            'requirement_type': self.requirement_type,
            'is_flexible': self.is_flexible,
            'priority_order': self.priority_order,
            'groups': [group.to_dict() for group in self.groups]
        }
    
    def evaluate_completion(self, student_courses):
        """Evaluate if this requirement is satisfied by student's courses"""
        if self.requirement_type == 'simple':
            return self._evaluate_simple_requirement(student_courses)
        elif self.requirement_type == 'grouped':
            return self._evaluate_grouped_requirement(student_courses)
        elif self.requirement_type == 'conditional':
            return self._evaluate_conditional_requirement(student_courses)
        else:
            return {'satisfied': False, 'error': 'Unknown requirement type'}
    
    def _evaluate_simple_requirement(self, student_courses):
        """Simple credit requirement - just count credits in category"""
        matching_courses = [
            course for course in student_courses 
            if course.requirement_category == self.category and course.status == 'completed'
        ]
        
        total_credits = sum(course.credits or course.course.credits for course in matching_courses)
        
        return {
            'satisfied': total_credits >= self.credits_required,
            'credits_earned': total_credits,
            'credits_required': self.credits_required,
            'courses_used': [course.to_dict() for course in matching_courses],
            'remaining_credits': max(0, self.credits_required - total_credits)
        }
    
    def _evaluate_grouped_requirement(self, student_courses):
        """Complex grouped requirement - check each group's rules"""
        group_results = []
        total_satisfied_credits = 0
        all_groups_satisfied = True
        
        for group in self.groups:
            group_result = group.evaluate_completion(student_courses)
            group_results.append(group_result)
            
            if group_result['satisfied']:
                total_satisfied_credits += group_result['credits_earned']
            else:
                all_groups_satisfied = False
        
        return {
            'satisfied': all_groups_satisfied and total_satisfied_credits >= self.credits_required,
            'credits_earned': total_satisfied_credits,
            'credits_required': self.credits_required,
            'group_results': group_results,
            'remaining_credits': max(0, self.credits_required - total_satisfied_credits)
        }
    
    def _evaluate_conditional_requirement(self, student_courses):
        """Conditional requirement - complex logic based on other requirements"""
        # Implementation depends on specific conditional rules
        # For now, treat as simple requirement
        return self._evaluate_simple_requirement(student_courses)

class RequirementGroup(db.Model):
    __tablename__ = 'requirement_groups'
    
    id = db.Column(db.Integer, primary_key=True)
    requirement_id = db.Column(db.Integer, db.ForeignKey('program_requirements.id'), nullable=False)
    group_name = db.Column(db.String(100), nullable=False)
    courses_required = db.Column(db.Integer, nullable=False)  # Number of courses to choose
    credits_required = db.Column(db.Integer)  # Alternative: require specific credits
    min_credits_per_course = db.Column(db.Integer, default=0)  # Minimum credits per course
    max_credits_per_course = db.Column(db.Integer)  # Maximum credits per course
    description = db.Column(db.Text)
    is_required = db.Column(db.Boolean, default=True)  # False for optional groups
    
    # Relationships
    course_options = db.relationship('GroupCourseOption', backref='group', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'requirement_id': self.requirement_id,
            'group_name': self.group_name,
            'courses_required': self.courses_required,
            'credits_required': self.credits_required,
            'min_credits_per_course': self.min_credits_per_course,
            'max_credits_per_course': self.max_credits_per_course,
            'description': self.description,
            'is_required': self.is_required,
            'course_options': [option.to_dict() for option in self.course_options]
        }
    
    def evaluate_completion(self, student_courses):
        """Evaluate if this group requirement is satisfied"""
        # Get courses that match this group's options
        option_codes = [opt.course_code for opt in self.course_options]
        
        matching_courses = []
        for course in student_courses:
            if (course.status == 'completed' and 
                course.course.code in option_codes and
                self._meets_credit_requirements(course)):
                matching_courses.append(course)
        
        # Sort by credits (descending) to maximize credit efficiency
        matching_courses.sort(key=lambda c: c.credits or c.course.credits, reverse=True)
        
        if self.courses_required:
            # Count-based requirement
            courses_taken = len(matching_courses)
            credits_earned = sum(c.credits or c.course.credits for c in matching_courses[:self.courses_required])
            
            return {
                'satisfied': courses_taken >= self.courses_required,
                'courses_taken': courses_taken,
                'courses_required': self.courses_required,
                'credits_earned': credits_earned,
                'courses_used': [c.to_dict() for c in matching_courses[:self.courses_required]],
                'group_name': self.group_name
            }
        
        elif self.credits_required:
            # Credit-based requirement
            total_credits = 0
            courses_used = []
            
            for course in matching_courses:
                if total_credits >= self.credits_required:
                    break
                course_credits = course.credits or course.course.credits
                total_credits += course_credits
                courses_used.append(course)
            
            return {
                'satisfied': total_credits >= self.credits_required,
                'credits_earned': total_credits,
                'credits_required': self.credits_required,
                'courses_used': [c.to_dict() for c in courses_used],
                'group_name': self.group_name
            }
        
        return {'satisfied': False, 'error': 'No completion criteria defined'}
    
    def _meets_credit_requirements(self, course):
        """Check if course meets credit hour requirements for this group"""
        course_credits = course.credits or course.course.credits
        
        if self.min_credits_per_course and course_credits < self.min_credits_per_course:
            return False
        
        if self.max_credits_per_course and course_credits > self.max_credits_per_course:
            return False
        
        return True

class GroupCourseOption(db.Model):
    __tablename__ = 'group_course_options'
    
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('requirement_groups.id'), nullable=False)
    course_code = db.Column(db.String(20), nullable=False)  # e.g., "ENG 101"
    institution = db.Column(db.String(100))  # Optional: restrict to specific institution
    is_preferred = db.Column(db.Boolean, default=False)  # Highlight preferred options
    notes = db.Column(db.Text)  # Additional notes about this option
    
    def to_dict(self):
        return {
            'id': self.id,
            'group_id': self.group_id,
            'course_code': self.course_code,
            'institution': self.institution,
            'is_preferred': self.is_preferred,
            'notes': self.notes
        }
