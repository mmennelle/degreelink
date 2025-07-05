# controllers/import_controller.py
from typing import Dict, Tuple
from .base_controller import BaseController
from services.import_service import ImportService

class ImportController(BaseController):
    """Controller for data import operations"""
    
    def __init__(self):
        super().__init__()
        self.service = ImportService()
    
    def import_csv(self) -> Tuple[Dict, int]:
        """Import course data from CSV file"""
        try:
            if 'file' not in self.request.files:
                return self.error_response("No file uploaded")
            
            file = self.request.files['file']
            if file.filename == '':
                return self.error_response("No file selected")
            
            if not file.filename.lower().endswith('.csv'):
                return self.error_response("File must be a CSV")
            
            result = self.service.import_csv_file(file)
            
            if 'errors' in result and result['processed'] == 0:
                return self.error_response(
                    message="Import failed - no valid data processed",
                    details=result
                )
            
            status_code = 200 if result['processed'] > 0 else 400
            return self.success_response(
                data=result,
                message=result['message'],
                status_code=status_code
            )
        except Exception as e:
            return self.handle_exception(e, "Import failed")
    
    def validate_csv(self) -> Tuple[Dict, int]:
        """Validate CSV file without importing"""
        try:
            if 'file' not in self.request.files:
                return self.error_response("No file uploaded")
            
            file = self.request.files['file']
            if file.filename == '':
                return self.error_response("No file selected")
            
            result = self.service.validate_csv_file(file)
            return self.success_response(data=result)
        except Exception as e:
            return self.handle_exception(e, "Validation failed")
