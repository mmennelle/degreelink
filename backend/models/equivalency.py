from . import db
from datetime import datetime

class Equivalency(db.Model):
    __tablename__ = 'equivalencies'
    
    id = db.Column(db.Integer, primary_key=True)
    from_course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False, index=True)
    to_course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False, index=True)
    equivalency_type = db.Column(db.String(50), default='direct') 
    notes = db.Column(db.Text)
    approved_by = db.Column(db.String(100))
    approved_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    
    __table_args__ = (db.UniqueConstraint('from_course_id', 'to_course_id', name='unique_equivalency'),)
    
    def __repr__(self):
        return f'<Equivalency {self.from_course.code} -> {self.to_course.code}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'from_course_id': self.from_course_id,
            'to_course_id': self.to_course_id,
            'from_course': self.from_course.to_dict() if self.from_course else None,
            'to_course': self.to_course.to_dict() if self.to_course else None,
            'equivalency_type': self.equivalency_type,
            'notes': self.notes,
            'approved_by': self.approved_by,
            'approved_date': self.approved_date.isoformat() if self.approved_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }