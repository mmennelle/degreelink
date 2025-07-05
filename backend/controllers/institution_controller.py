# controllers/institution_controller.py
from typing import List, Dict, Any, Tuple
from .base_controller import BaseController
from models.institution import Institution
from services.institution_service import InstitutionService

class InstitutionController(BaseController):
    """Controller for institution-related operations"""
    
    def __init__(self):
        super().__init__()
        self.service = InstitutionService()
    
    def get_all_institutions(self) -> Tuple[Dict, int]:
        """Get all institutions"""
        try:
            institutions = self.service.get_all_institutions()
            return self.success_response(data=institutions)
        except Exception as e:
            return self.handle_exception(e, "Failed to retrieve institutions")
    
    def get_institution(self, institution_id: int) -> Tuple[Dict, int]:
        """Get a specific institution"""
        try:
            institution = self.service.get_institution_by_id(institution_id)
            if not institution:
                return self.error_response("Institution not found", 404)
            
            return self.success_response(data=institution)
        except Exception as e:
            return self.handle_exception(e, "Failed to retrieve institution")
    
    def create_institution(self) -> Tuple[Dict, int]:
        """Create a new institution"""
        try:
            data = self.request.get_json()
            if not data:
                return self.error_response("No data provided")
            
            result = self.service.create_institution(data)
            
            if 'errors' in result:
                return self.validation_error_response(result['errors'])
            
            return self.success_response(
                data=result['institution'],
                message="Institution created successfully",
                status_code=201
            )
        except Exception as e:
            return self.handle_exception(e, "Failed to create institution")
    
    def update_institution(self, institution_id: int) -> Tuple[Dict, int]:
        """Update an existing institution"""
        try:
            data = self.request.get_json()
            if not data:
                return self.error_response("No data provided")
            
            result = self.service.update_institution(institution_id, data)
            
            if 'errors' in result:
                if 'not_found' in result:
                    return self.error_response("Institution not found", 404)
                return self.validation_error_response(result['errors'])
            
            return self.success_response(
                data=result['institution'],
                message="Institution updated successfully"
            )
        except Exception as e:
            return self.handle_exception(e, "Failed to update institution")
    
    def delete_institution(self, institution_id: int) -> Tuple[Dict, int]:
        """Delete an institution"""
        try:
            result = self.service.delete_institution(institution_id)
            
            if not result['success']:
                if result.get('not_found'):
                    return self.error_response("Institution not found", 404)
                return self.error_response(result.get('message', "Failed to delete institution"))
            
            return self.success_response(message="Institution deleted successfully")
        except Exception as e:
            return self.handle_exception(e, "Failed to delete institution")