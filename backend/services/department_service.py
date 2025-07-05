# services/department_service.py
from typing import Dict, Any, List, Optional
from .base_service import BaseService
from models.department import Department
from models.institution import Institution
from database.connection import get_db_connection

class DepartmentService(BaseService):
    """Service for department business logic"""
    
    def get_departments_by_institution(self, institution_id: int) -> List[Dict[str, Any]]:
        """Get all departments for an institution"""
        departments = Department.find_by_institution(institution_id)
        return [dept.to_dict() for dept in departments]
    
    def get_department_with_details(self, department_id: int) -> Optional[Dict[str, Any]]:
        """Get department with institution details"""
        conn = get_db_connection()
        row = conn.execute('''
            SELECT d.*, i.name as institution_name
            FROM Department d
            JOIN Institution i ON i.id = d.institution_id
            WHERE d.id = ?
        ''', (department_id,)).fetchone()
        conn.close()
        
        return dict(row) if row else None
    
    def create_department(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new department with validation"""
        # Validate required fields
        errors = self.validate_required_fields(data, ['name', 'institution_id'])
        if errors:
            return {'errors': errors}
        
        # Validate institution exists
        institution = Institution.find_by_id(data['institution_id'])
        if not institution:
            return {'errors': ['Invalid institution ID']}
        
        # Check for duplicate department in same institution
        existing = Department.find_by_name_and_institution(
            data['name'].strip(), 
            data['institution_id']
        )
        if existing:
            return {'errors': ['A department with this name already exists in this institution']}
        
        # Create and validate the department
        department = Department(
            name=data['name'].strip(),
            institution_id=data['institution_id']
        )
        validation_errors = department.validate()
        if validation_errors:
            return {'errors': validation_errors}
        
        # Save the department
        department.save()
        return {'department': department.to_dict()}
