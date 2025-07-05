# controllers/department_controller.py
from typing import List, Dict, Any, Tuple
from .base_controller import BaseController
from services.department_service import DepartmentService

class DepartmentController(BaseController):
    """Controller for department-related operations"""
    
    def __init__(self):
        super().__init__()
        self.service = DepartmentService()
    
    def get_departments_by_institution(self, institution_id: int) -> Tuple[Dict, int]:
        """Get all departments for an institution"""
        try:
            departments = self.service.get_departments_by_institution(institution_id)
            return self.success_response(data=departments)
        except Exception as e:
            return self.handle_exception(e, "Failed to retrieve departments")
    
    def get_department(self, department_id: int) -> Tuple[Dict, int]:
        """Get a specific department"""
        try:
            department = self.service.get_department_with_details(department_id)
            if not department:
                return self.error_response("Department not found", 404)
            
            return self.success_response(data=department)
        except Exception as e:
            return self.handle_exception(e, "Failed to retrieve department")
    
    def create_department(self) -> Tuple[Dict, int]:
        """Create a new department"""
        try:
            data = self.request.get_json()
            if not data:
                return self.error_response("No data provided")
            
            result = self.service.create_department(data)
            
            if 'errors' in result:
                return self.validation_error_response(result['errors'])
            
            return self.success_response(
                data=result['department'],
                message="Department created successfully",
                status_code=201
            )
        except Exception as e:
            return self.handle_exception(e, "Failed to create department")