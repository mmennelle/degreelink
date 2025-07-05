# services/transfer_plan_service.py
import json
import secrets
import string
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from .base_service import BaseService
from models.transfer_plan import TransferPlan
from models.course import Course
from models.institution import Institution
from database.connection import get_db_connection

class TransferPlanService(BaseService):
    """Service for transfer plan business logic"""
    
    def generate_plan_code(self) -> str:
        """Generate a unique 8-character alphanumeric code"""
        return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
    
    def cleanup_expired_plans(self) -> int:
        """Remove plans older than 1 year, return count of deleted plans"""
        conn = get_db_connection()
        cutoff_date = datetime.now() - timedelta(days=365)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM TransferPlan WHERE created_at < ?', (cutoff_date,))
        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()
        return deleted_count
    
    def create_transfer_plan(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new transfer plan with validation"""
        # Validate required fields
        errors = self.validate_required_fields(data, [
            'plan_name', 'source_institution_id', 'target_institution_id', 'selected_courses'
        ])
        if errors:
            return {'errors': errors}
        
        # Additional validation
        if not isinstance(data['selected_courses'], list):
            return {'errors': ['Selected courses must be a list']}
        
        if len(data['selected_courses']) == 0:
            return {'errors': ['At least one course must be selected']}
        
        # Validate institutions exist
        source_institution = Institution.find_by_id(data['source_institution_id'])
        target_institution = Institution.find_by_id(data['target_institution_id'])
        
        if not source_institution:
            return {'errors': ['Invalid source institution ID']}
        if not target_institution:
            return {'errors': ['Invalid target institution ID']}
        
        # Validate courses exist
        course_ids = data['selected_courses']
        conn = get_db_connection()
        placeholders = ','.join(['?' for _ in course_ids])
        existing_courses = conn.execute(
            f"SELECT id FROM Course WHERE id IN ({placeholders})", 
            course_ids
        ).fetchall()
        conn.close()
        
        existing_course_ids = [row['id'] for row in existing_courses]
        invalid_courses = [cid for cid in course_ids if cid not in existing_course_ids]
        
        if invalid_courses:
            return {'errors': [f'Invalid course IDs: {invalid_courses}']}
        
        # Generate unique plan code
        code = self.generate_plan_code()
        conn = get_db_connection()
        while conn.execute('SELECT id FROM TransferPlan WHERE code = ?', (code,)).fetchone():
            code = self.generate_plan_code()
        
        # Create plan data
        plan_data = {
            **data,
            'total_courses': len(course_ids),
            'created_by_user': True,
            'created_at': datetime.now().isoformat()
        }
        
        # Save the plan
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO TransferPlan (code, plan_name, source_institution_id, target_institution_id, selected_courses, plan_data)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            code,
            data['plan_name'],
            data['source_institution_id'],
            data['target_institution_id'],
            json.dumps(course_ids),
            json.dumps(plan_data)
        ))
        
        plan_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Return the created plan
        plan = self.get_transfer_plan(code)
        return {
            'plan_code': code,
            'plan': plan
        }
    
    def get_transfer_plan(self, plan_code: str) -> Optional[Dict[str, Any]]:
        """Get a transfer plan by code with full details"""
        conn = get_db_connection()
        
        plan = conn.execute('''
            SELECT tp.*, 
                   si.name as source_institution_name,
                   ti.name as target_institution_name
            FROM TransferPlan tp
            JOIN Institution si ON si.id = tp.source_institution_id
            JOIN Institution ti ON ti.id = tp.target_institution_id
            WHERE tp.code = ?
        ''', (plan_code.upper(),)).fetchone()
        
        if not plan:
            conn.close()
            return None
        
        # Get detailed course information
        selected_courses = json.loads(plan['selected_courses'])
        detailed_courses = []
        
        for course_id in selected_courses:
            course = conn.execute('''
                SELECT c.*, i.name as institution_name, d.name as department_name
                FROM Course c
                JOIN Institution i ON i.id = c.institution_id
                JOIN Department d ON d.id = c.department_id
                WHERE c.id = ?
            ''', (course_id,)).fetchone()
            
            if course:
                detailed_courses.append(dict(course))
        
        conn.close()
        
        return {
            'code': plan['code'],
            'plan_name': plan['plan_name'],
            'source_institution': plan['source_institution_name'],
            'target_institution': plan['target_institution_name'],
            'source_institution_id': plan['source_institution_id'],
            'target_institution_id': plan['target_institution_id'],
            'created_at': plan['created_at'],
            'selected_courses': detailed_courses,
            'plan_data': json.loads(plan['plan_data'])
        }
    
    def update_transfer_plan(self, plan_code: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing transfer plan"""
        # Check if plan exists
        existing_plan = self.get_transfer_plan(plan_code)
        if not existing_plan:
            return {'errors': ['Plan not found'], 'not_found': True}
        
        # Validate required fields
        errors = self.validate_required_fields(data, [
            'plan_name', 'source_institution_id', 'target_institution_id', 'selected_courses'
        ])
        if errors:
            return {'errors': errors}
        
        # Same validation as create (reuse logic)
        validation_result = self._validate_plan_data(data)
        if 'errors' in validation_result:
            return validation_result
        
        # Update plan data
        plan_data = {
            **data,
            'total_courses': len(data['selected_courses']),
            'updated_by_user': True,
            'last_updated': datetime.now().isoformat()
        }
        
        # Save updates
        conn = get_db_connection()
        conn.execute('''
            UPDATE TransferPlan 
            SET plan_name = ?, source_institution_id = ?, target_institution_id = ?, 
                selected_courses = ?, plan_data = ?
            WHERE code = ?
        ''', (
            data['plan_name'],
            data['source_institution_id'],
            data['target_institution_id'],
            json.dumps(data['selected_courses']),
            json.dumps(plan_data),
            plan_code.upper()
        ))
        conn.commit()
        conn.close()
        
        # Return updated plan
        plan = self.get_transfer_plan(plan_code)
        return {'plan': plan}
    
    def delete_transfer_plan(self, plan_code: str) -> Dict[str, Any]:
        """Delete a transfer plan"""
        conn = get_db_connection()
        
        # Check if plan exists
        plan = conn.execute('SELECT * FROM TransferPlan WHERE code = ?', (plan_code.upper(),)).fetchone()
        if not plan:
            conn.close()
            return {'success': False, 'not_found': True}
        
        # Delete the plan
        cursor = conn.cursor()
        cursor.execute('DELETE FROM TransferPlan WHERE code = ?', (plan_code.upper(),))
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        return {'success': success}
    
    def search_equivalents_bulk(self, course_ids: List[int]) -> Dict[int, List[Dict[str, Any]]]:
        """Search for equivalents of multiple courses at once"""
        if not course_ids:
            return {}
        
        conn = get_db_connection()
        equivalents = {}
        
        for course_id in course_ids:
            rows = conn.execute('''
                SELECT c.*, i.name as institution_name, d.name as department_name 
                FROM CourseEquivalency e
                JOIN Course c ON c.id = e.target_course_id
                JOIN Institution i ON i.id = c.institution_id
                JOIN Department d ON d.id = c.department_id
                WHERE e.source_course_id = ?
                UNION
                SELECT c.*, i.name as institution_name, d.name as department_name 
                FROM CourseEquivalency e
                JOIN Course c ON c.id = e.source_course_id
                JOIN Institution i ON i.id = c.institution_id
                JOIN Department d ON d.id = c.department_id
                WHERE e.target_course_id = ?
                ORDER BY institution_name, department_name, code
            ''', (course_id, course_id)).fetchall()
            
            equivalents[course_id] = [dict(r) for r in rows]
        
        conn.close()
        return equivalents
    
    def _validate_plan_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate plan data (reusable validation logic)"""
        if not isinstance(data['selected_courses'], list):
            return {'errors': ['Selected courses must be a list']}
        
        if len(data['selected_courses']) == 0:
            return {'errors': ['At least one course must be selected']}
        
        # Validate institutions exist
        source_institution = Institution.find_by_id(data['source_institution_id'])
        target_institution = Institution.find_by_id(data['target_institution_id'])
        
        if not source_institution:
            return {'errors': ['Invalid source institution ID']}
        if not target_institution:
            return {'errors': ['Invalid target institution ID']}
        
        # Validate courses exist
        course_ids = data['selected_courses']
        conn = get_db_connection()
        placeholders = ','.join(['?' for _ in course_ids])
        existing_courses = conn.execute(
            f"SELECT id FROM Course WHERE id IN ({placeholders})", 
            course_ids
        ).fetchall()
        conn.close()
        
        existing_course_ids = [row['id'] for row in existing_courses]
        invalid_courses = [cid for cid in course_ids if cid not in existing_course_ids]
        
        if invalid_courses:
            return {'errors': [f'Invalid course IDs: {invalid_courses}']}
        
        return {'valid': True}