# services/course_service.py
from typing import Dict, Any, List, Optional
from .base_service import BaseService
from models.course import Course
from models.department import Department
from models.institution import Institution
from database.connection import get_db_connection

class CourseService(BaseService):
    """Service for course business logic"""
    
    def get_courses_by_department(self, department_id: int) -> List[Dict[str, Any]]:
        """Get all courses for a department"""
        courses = Course.find_by_department(department_id)
        return [course.to_dict() for course in courses]
    
    def get_course_with_details(self, course_id: int) -> Optional[Dict[str, Any]]:
        """Get course with full details"""
        return Course.find_with_details(course_id)
    
    def get_course_equivalents(self, course_id: int) -> List[Dict[str, Any]]:
        """Get equivalent courses for a given course"""
        conn = get_db_connection()
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
        conn.close()
        
        return [dict(row) for row in rows]
    
    def search_courses(self, query: str = '', institution_id: int = None, 
                      department_id: int = None) -> List[Dict[str, Any]]:
        """Search courses based on criteria"""
        conn = get_db_connection()
        
        # Build dynamic query
        sql = '''
            SELECT c.*, i.name as institution_name, d.name as department_name
            FROM Course c
            JOIN Institution i ON i.id = c.institution_id
            JOIN Department d ON d.id = c.department_id
            WHERE 1=1
        '''
        params = []
        
        if query:
            sql += ' AND (c.code LIKE ? OR c.title LIKE ?)'
            like_query = f'%{query}%'
            params.extend([like_query, like_query])
        
        if institution_id:
            sql += ' AND c.institution_id = ?'
            params.append(institution_id)
        
        if department_id:
            sql += ' AND c.department_id = ?'
            params.append(department_id)
        
        sql += ' ORDER BY i.name, d.name, c.code'
        
        rows = conn.execute(sql, params).fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def create_course(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new course with validation"""
        # Validate required fields
        errors = self.validate_required_fields(data, 
            ['code', 'title', 'department_id', 'institution_id'])
        if errors:
            return {'errors': errors}
        
        # Validate department and institution exist
        department = Department.find_by_id(data['department_id'])
        if not department:
            return {'errors': ['Invalid department ID']}
        
        institution = Institution.find_by_id(data['institution_id'])
        if not institution:
            return {'errors': ['Invalid institution ID']}
        
        # Validate department belongs to institution
        if department.institution_id != data['institution_id']:
            return {'errors': ['Department does not belong to the specified institution']}
        
        # Create and validate the course
        course = Course(
            code=data['code'].strip(),
            title=data['title'].strip(),
            department_id=data['department_id'],
            institution_id=data['institution_id']
        )
        validation_errors = course.validate()
        if validation_errors:
            return {'errors': validation_errors}
        
        # Check for duplicate course
        conn = get_db_connection()
        existing = conn.execute(
            "SELECT id FROM Course WHERE code = ? AND department_id = ? AND institution_id = ?",
            (course.code, course.department_id, course.institution_id)
        ).fetchone()
        conn.close()
        
        if existing:
            return {'errors': ['A course with this code already exists in this department']}
        
        # Save the course
        course.save()
        return {'course': Course.find_with_details(course.id)}