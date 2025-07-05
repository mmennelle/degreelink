# controllers/course_controller.py
from typing import List, Dict, Any, Tuple
from .base_controller import BaseController
from models.course import Course
from models.department import Department
from services.course_service import CourseService

class CourseController(BaseController):
    """Controller for course-related operations"""
    
    def __init__(self):
        super().__init__()
        self.service = CourseService()
    
    def get_courses_by_department(self, department_id: int) -> Tuple[Dict, int]:
        """Get all courses for a department"""
        try:
            courses = self.service.get_courses_by_department(department_id)
            return self.success_response(data=courses)
        except Exception as e:
            return self.handle_exception(e, "Failed to retrieve courses")
    
    def get_course(self, course_id: int) -> Tuple[Dict, int]:
        """Get a specific course with details"""
        try:
            course = self.service.get_course_with_details(course_id)
            if not course:
                return self.error_response("Course not found", 404)
            
            return self.success_response(data=course)
        except Exception as e:
            return self.handle_exception(e, "Failed to retrieve course")
    
    def get_course_equivalents(self, course_id: int) -> Tuple[Dict, int]:
        """Get equivalent courses for a given course"""
        try:
            equivalents = self.service.get_course_equivalents(course_id)
            return self.success_response(data=equivalents)
        except Exception as e:
            return self.handle_exception(e, "Failed to retrieve course equivalents")
    
    def search_courses(self) -> Tuple[Dict, int]:
        """Search courses based on criteria"""
        try:
            query = self.request.args.get('q', '')
            institution_id = self.request.args.get('institution_id', type=int)
            department_id = self.request.args.get('department_id', type=int)
            
            courses = self.service.search_courses(
                query=query,
                institution_id=institution_id,
                department_id=department_id
            )
            
            return self.success_response(data=courses)
        except Exception as e:
            return self.handle_exception(e, "Failed to search courses")
    
    def create_course(self) -> Tuple[Dict, int]:
        """Create a new course"""
        try:
            data = self.request.get_json()
            if not data:
                return self.error_response("No data provided")
            
            result = self.service.create_course(data)
            
            if 'errors' in result:
                return self.validation_error_response(result['errors'])
            
            return self.success_response(
                data=result['course'],
                message="Course created successfully",
                status_code=201
            )
        except Exception as e:
            return self.handle_exception(e, "Failed to create course")
