# models/equivalency.py - Missing model
from typing import Dict, List, Optional, Any
from .base import BaseModel
from .course import Course
from database.connection import get_db_connection

class CourseEquivalency(BaseModel):
    """Course equivalency model"""
    
    def __init__(self, source_course_id: int = None, target_course_id: int = None, id: int = None):
        super().__init__()
        self.id = id
        self.source_course_id = source_course_id
        self.target_course_id = target_course_id
    
    @classmethod
    def table_name(cls) -> str:
        return "CourseEquivalency"
    
    @classmethod
    def create_table_sql(cls) -> str:
        return '''
            CREATE TABLE IF NOT EXISTS CourseEquivalency (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_course_id INTEGER NOT NULL,
                target_course_id INTEGER NOT NULL,
                FOREIGN KEY (source_course_id) REFERENCES Course (id),
                FOREIGN KEY (target_course_id) REFERENCES Course (id),
                UNIQUE(source_course_id, target_course_id)
            )
        '''
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'source_course_id': self.source_course_id,
            'target_course_id': self.target_course_id
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CourseEquivalency':
        return cls(
            id=data.get('id'),
            source_course_id=data.get('source_course_id'),
            target_course_id=data.get('target_course_id')
        )
    
    @classmethod
    def create_equivalency(cls, source_course_id: int, target_course_id: int) -> bool:
        """Create bidirectional equivalency relationship"""
        if source_course_id == target_course_id:
            return False
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Insert equivalency (handles duplicates with OR IGNORE)
            cursor.execute("""
                INSERT OR IGNORE INTO CourseEquivalency (source_course_id, target_course_id) 
                VALUES (?, ?)
            """, (source_course_id, target_course_id))
            
            conn.commit()
            return True
        except Exception:
            return False
        finally:
            conn.close()
    
    def validate(self) -> List[str]:
        """Validate equivalency data"""
        errors = []
        
        if not self.source_course_id:
            errors.append("Source course ID is required")
        elif not Course.find_by_id(self.source_course_id):
            errors.append("Invalid source course ID")
            
        if not self.target_course_id:
            errors.append("Target course ID is required")
        elif not Course.find_by_id(self.target_course_id):
            errors.append("Invalid target course ID")
            
        if self.source_course_id == self.target_course_id:
            errors.append("Source and target courses cannot be the same")
            
        return errors
