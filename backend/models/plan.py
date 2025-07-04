from . import db
from datetime import datetime
import json

class Plan(db.Model):
    __tablename__ = 'plans'
    
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(200), nullable=False)
    student_email = db.Column(db.String(200))
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    plan_name = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='draft')  # draft, active, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    courses = db.relationship('PlanCourse', backref='plan', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Plan {self.plan_name} for {self.student_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_name': self.student_name,
            'student_email': self.student_email,
            'program_id': self.program_id,
            'plan_name': self.plan_name,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'courses': [course.to_dict() for course in self.courses]
        }
    
    def calculate_progress(self):
        """Calculate program completion progress"""
        total_credits = sum(course.credits for course in self.courses if course.status == 'completed')
        required_credits = self.program.total_credits_required
        
        progress = {
            'total_credits_earned': total_credits,
            'total_credits_required': required_credits,
            'completion_percentage': (total_credits / required_credits * 100) if required_credits > 0 else 0,
            'remaining_credits': max(0, required_credits - total_credits)
        }
        
        return progress
    
    def get_unmet_requirements(self):
        """Determine which program requirements are not yet met"""
        # This is a simplified version - in practice, you'd need more complex logic
        # to match courses to specific requirements
        unmet = []
        for requirement in self.program.requirements:
            completed_credits = sum(
                course.credits for course in self.courses 
                if course.status == 'completed' and course.requirement_category == requirement.category
            )
            if completed_credits < requirement.credits_required:
                unmet.append({
                    'category': requirement.category,
                    'credits_needed': requirement.credits_required - completed_credits,
                    'description': requirement.description
                })
        return unmet

class PlanCourse(db.Model):
    __tablename__ = 'plan_courses'
    
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    semester = db.Column(db.String(50))  # Fall 2024, Spring 2025, etc.
    year = db.Column(db.Integer)
    status = db.Column(db.String(50), default='planned')  # planned, in_progress, completed
    grade = db.Column(db.String(10))
    credits = db.Column(db.Integer)  # Override course credits if needed
    requirement_category = db.Column(db.String(100))  # Which requirement this fulfills
    notes = db.Column(db.Text)
    
    # Relationships
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