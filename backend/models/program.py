from . import db
from datetime import datetime

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
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ProgramRequirement(db.Model):
    __tablename__ = 'program_requirements'
    
    id = db.Column(db.Integer, primary_key=True)
    program_id = db.Column(db.Integer, db.ForeignKey('programs.id'), nullable=False)
    category = db.Column(db.String(100), nullable=False)  # Core, Elective, Gen Ed, etc.
    credits_required = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    required_courses = db.Column(db.Text)  # JSON string of course IDs or codes
    
    def to_dict(self):
        return {
            'id': self.id,
            'program_id': self.program_id,
            'category': self.category,
            'credits_required': self.credits_required,
            'description': self.description,
            'required_courses': self.required_courses
        }