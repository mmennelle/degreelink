# controllers/transfer_plan_controller.py
from typing import List, Dict, Any, Tuple
from .base_controller import BaseController
from services.transfer_plan_service import TransferPlanService

class TransferPlanController(BaseController):
    """Controller for transfer plan operations"""
    
    def __init__(self):
        super().__init__()
        self.service = TransferPlanService()
    
    def create_plan(self) -> Tuple[Dict, int]:
        """Create a new transfer plan"""
        try:
            data = self.request.get_json()
            if not data:
                return self.error_response("No data provided")
            
            result = self.service.create_transfer_plan(data)
            
            if 'errors' in result:
                return self.validation_error_response(result['errors'])
            
            return self.success_response(
                data={
                    'plan_code': result['plan_code'],
                    'plan': result['plan']
                },
                message=f"Plan '{result['plan']['plan_name']}' created successfully",
                status_code=201
            )
        except Exception as e:
            return self.handle_exception(e, "Failed to create transfer plan")
    
    def get_plan(self, plan_code: str) -> Tuple[Dict, int]:
        """Get a transfer plan by code"""
        try:
            plan = self.service.get_transfer_plan(plan_code)
            if not plan:
                return self.error_response("Plan not found", 404)
            
            return self.success_response(data={'plan': plan})
        except Exception as e:
            return self.handle_exception(e, "Failed to retrieve transfer plan")
    
    def update_plan(self, plan_code: str) -> Tuple[Dict, int]:
        """Update an existing transfer plan"""
        try:
            data = self.request.get_json()
            if not data:
                return self.error_response("No data provided")
            
            result = self.service.update_transfer_plan(plan_code, data)
            
            if 'errors' in result:
                if 'not_found' in result:
                    return self.error_response("Plan not found", 404)
                return self.validation_error_response(result['errors'])
            
            return self.success_response(
                data={
                    'plan_code': plan_code,
                    'plan': result['plan']
                },
                message="Plan updated successfully"
            )
        except Exception as e:
            return self.handle_exception(e, "Failed to update transfer plan")
    
    def delete_plan(self, plan_code: str) -> Tuple[Dict, int]:
        """Delete a transfer plan"""
        try:
            result = self.service.delete_transfer_plan(plan_code)
            
            if not result['success']:
                if result.get('not_found'):
                    return self.error_response("Plan not found", 404)
                return self.error_response(result.get('message', "Failed to delete plan"))
            
            return self.success_response(message="Plan deleted successfully")
        except Exception as e:
            return self.handle_exception(e, "Failed to delete transfer plan")
    
    def search_equivalents_bulk(self) -> Tuple[Dict, int]:
        """Search for equivalents of multiple courses at once"""
        try:
            data = self.request.get_json()
            if not data or 'course_ids' not in data:
                return self.error_response("Course IDs are required")
            
            course_ids = data['course_ids']
            if not isinstance(course_ids, list):
                return self.error_response("Course IDs must be a list")
            
            equivalents = self.service.search_equivalents_bulk(course_ids)
            return self.success_response(data={'equivalents': equivalents})
        except Exception as e:
            return self.handle_exception(e, "Failed to search course equivalents")
