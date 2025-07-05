# services/base_service.py
from abc import ABC
from typing import Dict, Any, List

class BaseService(ABC):
    """Base service class with common functionality"""
    
    def validate_required_fields(self, data: Dict[str, Any], required_fields: List[str]) -> List[str]:
        """Validate that required fields are present and not empty"""
        errors = []
        for field in required_fields:
            if field not in data:
                errors.append(f"Missing required field: {field}")
            elif not data[field] or (isinstance(data[field], str) and not data[field].strip()):
                errors.append(f"Field '{field}' cannot be empty")
        return errors
