# controllers/base_controller.py
from flask import request, jsonify
from typing import Dict, Any, List, Optional, Tuple
import traceback

class BaseController:
    """Base controller with common functionality"""
    
    def __init__(self):
        self.request = request
    
    def success_response(self, data: Any = None, message: str = None, status_code: int = 200) -> Tuple[Dict, int]:
        """Create a successful response"""
        response = {'success': True}
        if data is not None:
            response['data'] = data
        if message:
            response['message'] = message
        return jsonify(response), status_code
    
    def error_response(self, message: str, status_code: int = 400, details: Any = None) -> Tuple[Dict, int]:
        """Create an error response"""
        response = {
            'success': False,
            'error': message
        }
        if details:
            response['details'] = details
        return jsonify(response), status_code
    
    def validation_error_response(self, errors: List[str]) -> Tuple[Dict, int]:
        """Create a validation error response"""
        return self.error_response(
            message="Validation failed",
            status_code=422,
            details={'validation_errors': errors}
        )
    
    def handle_exception(self, e: Exception, message: str = "An error occurred") -> Tuple[Dict, int]:
        """Handle exceptions with proper logging"""
        print(f"Controller Exception: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        
        return self.error_response(
            message=f"{message}: {str(e)}",
            status_code=500
        )