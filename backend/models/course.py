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
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    equivalent_from = db.relationship('Equivalency', foreign_keys='Equivalency.from_course_id', backref='from_course')
    equivalent_to = db.relationship('Equivalency', foreign_keys='Equivalency.to_course_id', backref='to_course')
    
    def __repr__(self):
        return f'<Course {self.code}: {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'title': self.title,
            'description': self.description,
            'credits': self.credits,
            'institution': self.institution,
            'department': self.department,
            'prerequisites': self.prerequisites,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
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