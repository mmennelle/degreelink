# models/program.py
from typing import Dict, List, Optional, Any
from .base import BaseModel
from .department import Department
from .institution import Institution
from database.connection import get_db_connection

class Program(BaseModel):
    """Academic program model (e.g., Biology AS, Computer Science BS)"""
    
    def __init__(self, name: str = None, degree_type: str = None, 
                 department_id: int = None, institution_id: int = None,
                 description: str = None, total_credits: int = None, id: int = None):
        super().__init__()
        self.id = id
        self.name = name
        self.degree_type = degree_type  # AS, BS, BA, MS, etc.
        self.department_id = department_id
        self.institution_id = institution_id
        self.description = description
        self.total_credits = total_credits
        self._department = None
        self._institution = None
    
    @classmethod
    def table_name(cls) -> str:
        return "Program"
    
    @classmethod
    def create_table_sql(cls) -> str:
        return '''
            CREATE TABLE IF NOT EXISTS Program (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                degree_type TEXT NOT NULL,
                department_id INTEGER NOT NULL,
                institution_id INTEGER NOT NULL,
                description TEXT,
                total_credits INTEGER,
                FOREIGN KEY (department_id) REFERENCES Department (id),
                FOREIGN KEY (institution_id) REFERENCES Institution (id),
                UNIQUE(name, degree_type, department_id, institution_id)
            )
        '''
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'degree_type': self.degree_type,
            'department_id': self.department_id,
            'institution_id': self.institution_id,
            'description': self.description,
            'total_credits': self.total_credits
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Program':
        return cls(
            id=data.get('id'),
            name=data.get('name'),
            degree_type=data.get('degree_type'),
            department_id=data.get('department_id'),
            institution_id=data.get('institution_id'),
            description=data.get('description'),
            total_credits=data.get('total_credits')
        )
    
    @property
    def full_name(self) -> str:
        """Get full program name with degree type"""
        return f"{self.name} ({self.degree_type})"
    
    @classmethod
    def find_by_department(cls, department_id: int) -> List['Program']:
        """Find all programs for a department"""
        conn = get_db_connection()
        rows = conn.execute(
            "SELECT * FROM Program WHERE department_id = ? ORDER BY name, degree_type", 
            (department_id,)
        ).fetchall()
        conn.close()
        
        return [cls.from_dict(dict(row)) for row in rows]
    
    def validate(self) -> List[str]:
        """Validate program data"""
        errors = []
        
        if not self.name or not self.name.strip():
            errors.append("Program name is required")
            
        if not self.degree_type or not self.degree_type.strip():
            errors.append("Degree type is required")
            
        if not self.department_id:
            errors.append("Department ID is required")
            
        if not self.institution_id:
            errors.append("Institution ID is required")
            
        return errors