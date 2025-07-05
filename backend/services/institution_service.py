# services/institution_service.py
from typing import Dict, Any, List, Optional
from .base_service import BaseService
from models.institution import Institution

class InstitutionService(BaseService):
    """Service for institution business logic"""
    
    def get_all_institutions(self) -> List[Dict[str, Any]]:
        """Get all institutions as dictionaries"""
        institutions = Institution.find_all()
        return [inst.to_dict() for inst in institutions]
    
    def get_institution_by_id(self, institution_id: int) -> Optional[Dict[str, Any]]:
        """Get institution by ID"""
        institution = Institution.find_by_id(institution_id)
        return institution.to_dict() if institution else None
    
    def create_institution(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new institution with validation"""
        # Validate required fields
        errors = self.validate_required_fields(data, ['name'])
        if errors:
            return {'errors': errors}
        
        # Check for duplicate
        existing = Institution.find_by_name(data['name'].strip())
        if existing:
            return {'errors': ['An institution with this name already exists']}
        
        # Create and validate the institution
        institution = Institution(name=data['name'].strip())
        validation_errors = institution.validate()
        if validation_errors:
            return {'errors': validation_errors}
        
        # Save the institution
        institution.save()
        return {'institution': institution.to_dict()}
    
    def update_institution(self, institution_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing institution"""
        institution = Institution.find_by_id(institution_id)
        if not institution:
            return {'errors': ['Institution not found'], 'not_found': True}
        
        # Validate required fields
        errors = self.validate_required_fields(data, ['name'])
        if errors:
            return {'errors': errors}
        
        # Check for duplicate (excluding current institution)
        existing = Institution.find_by_name(data['name'].strip())
        if existing and existing.id != institution_id:
            return {'errors': ['An institution with this name already exists']}
        
        # Update and validate
        institution.name = data['name'].strip()
        validation_errors = institution.validate()
        if validation_errors:
            return {'errors': validation_errors}
        
        # Save the updated institution
        institution.save()
        return {'institution': institution.to_dict()}
    
    def delete_institution(self, institution_id: int) -> Dict[str, Any]:
        """Delete an institution"""
        institution = Institution.find_by_id(institution_id)
        if not institution:
            return {'success': False, 'not_found': True}
        
        # Check if institution has dependencies (departments/courses)
        from models.department import Department
        departments = Department.find_by_institution(institution_id)
        if departments:
            return {
                'success': False, 
                'message': 'Cannot delete institution that has departments'
            }
        
        success = institution.delete()
        return {'success': success}
