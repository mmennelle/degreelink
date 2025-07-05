# models/transfer_plan.py - Missing model
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from .base import BaseModel
from database.connection import get_db_connection

class TransferPlan(BaseModel):
    """Transfer plan model"""
    
    def __init__(self, code: str = None, plan_name: str = None, 
                 source_institution_id: int = None, target_institution_id: int = None,
                 selected_courses: str = None, plan_data: str = None, 
                 created_at: str = None, id: int = None):
        super().__init__()
        self.id = id
        self.code = code
        self.plan_name = plan_name
        self.source_institution_id = source_institution_id
        self.target_institution_id = target_institution_id
        self.selected_courses = selected_courses  # JSON string
        self.plan_data = plan_data  # JSON string
        self.created_at = created_at
    
    @classmethod
    def table_name(cls) -> str:
        return "TransferPlan"
    
    @classmethod
    def create_table_sql(cls) -> str:
        return '''
            CREATE TABLE IF NOT EXISTS TransferPlan (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT UNIQUE NOT NULL,
                plan_name TEXT NOT NULL,
                source_institution_id INTEGER NOT NULL,
                target_institution_id INTEGER NOT NULL,
                selected_courses TEXT NOT NULL,
                plan_data TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_institution_id) REFERENCES Institution (id),
                FOREIGN KEY (target_institution_id) REFERENCES Institution (id)
            )
        '''
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'code': self.code,
            'plan_name': self.plan_name,
            'source_institution_id': self.source_institution_id,
            'target_institution_id': self.target_institution_id,
            'selected_courses': self.selected_courses,
            'plan_data': self.plan_data,
            'created_at': self.created_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TransferPlan':
        return cls(
            id=data.get('id'),
            code=data.get('code'),
            plan_name=data.get('plan_name'),
            source_institution_id=data.get('source_institution_id'),
            target_institution_id=data.get('target_institution_id'),
            selected_courses=data.get('selected_courses'),
            plan_data=data.get('plan_data'),
            created_at=data.get('created_at')
        )
    
    @classmethod
    def find_by_code(cls, code: str) -> Optional['TransferPlan']:
        """Find transfer plan by code"""
        conn = get_db_connection()
        row = conn.execute('SELECT * FROM TransferPlan WHERE code = ?', (code.upper(),)).fetchone()
        conn.close()
        
        if row:
            return cls.from_dict(dict(row))
        return None
    
    def get_selected_courses_list(self) -> List[int]:
        """Get selected courses as list of IDs"""
        if self.selected_courses:
            return json.loads(self.selected_courses)
        return []
    
    def get_plan_data_dict(self) -> Dict[str, Any]:
        """Get plan data as dictionary"""
        if self.plan_data:
            return json.loads(self.plan_data)
        return {}
    
    def validate(self) -> List[str]:
        """Validate transfer plan data"""
        errors = []
        
        if not self.code or not self.code.strip():
            errors.append("Plan code is required")
        elif len(self.code.strip()) != 8:
            errors.append("Plan code must be exactly 8 characters")
            
        if not self.plan_name or not self.plan_name.strip():
            errors.append("Plan name is required")
        elif len(self.plan_name.strip()) > 255:
            errors.append("Plan name must be 255 characters or less")
            
        if not self.source_institution_id:
            errors.append("Source institution ID is required")
            
        if not self.target_institution_id:
            errors.append("Target institution ID is required")
            
        if not self.selected_courses:
            errors.append("Selected courses are required")
        else:
            try:
                courses = json.loads(self.selected_courses)
                if not isinstance(courses, list) or len(courses) == 0:
                    errors.append("At least one course must be selected")
            except json.JSONDecodeError:
                errors.append("Invalid selected courses format")
                
        return errors