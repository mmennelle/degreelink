"""Prerequisite validation service.

This service checks if a student can take a course based on completed courses
and equivalencies. It handles transitive equivalencies where:
- Course A at school 1 is equivalent to Course B at school 2
- Course B is prerequisite to Course D
- Therefore, Course A satisfies the prerequisite for Course D
"""

from backend.models import db
from backend.models.course import Course
from backend.models.equivalency import Equivalency
from backend.models.plan import PlanCourse
import re


class PrerequisiteService:
    """Service for validating course prerequisites with equivalency support."""
    
    @staticmethod
    def parse_prerequisites(prerequisites_str):
        """
        Parse a prerequisites string into a list of course codes.
        
        Expected format: "MATH 101, BIOL 200" or "CSCI 1583, CSCI 2001"
        Returns a list of course codes in normalized format.
        
        Args:
            prerequisites_str: String containing prerequisite course codes
            
        Returns:
            List of normalized course codes (e.g., ['MATH 101', 'BIOL 200'])
        """
        if not prerequisites_str or not prerequisites_str.strip():
            return []
        
        # Split by common delimiters: comma, semicolon, "and", "or"
        # For now, treat all prerequisites as required (AND logic)
        parts = re.split(r'[,;]|\s+and\s+|\s+or\s+', prerequisites_str, flags=re.IGNORECASE)
        
        course_codes = []
        for part in parts:
            part = part.strip()
            if not part:
                continue
            
            # Normalize course code format
            # Handle formats like "MATH101", "MATH 101", "MATH-101"
            match = re.match(r'^([A-Za-z]+)[\s-]*(\d+[A-Za-z]*)$', part)
            if match:
                subject = match.group(1).upper()
                number = match.group(2).upper()
                normalized = f"{subject} {number}"
                course_codes.append(normalized)
        
        return course_codes
    
    @staticmethod
    def get_equivalent_courses(course_code, institution=None):
        """
        Get all courses equivalent to the given course code.
        
        This finds direct equivalencies and returns a set of all equivalent
        course codes including the original.
        
        Args:
            course_code: Course code to find equivalents for (e.g., "MATH 101")
            institution: Optional institution filter
            
        Returns:
            Set of equivalent course codes including the original
        """
        # Find the course in the database
        query = Course.query.filter(Course.code == course_code)
        if institution:
            query = query.filter(Course.institution == institution)
        
        course = query.first()
        if not course:
            # Course not found, return just the code itself
            return {course_code}
        
        equivalent_codes = {course.code}
        
        # Find all courses this course is equivalent to
        # Check both directions of equivalency
        from_equivalencies = Equivalency.query.filter(
            Equivalency.from_course_id == course.id
        ).all()
        
        to_equivalencies = Equivalency.query.filter(
            Equivalency.to_course_id == course.id
        ).all()
        
        # Add all equivalent course codes
        for equiv in from_equivalencies:
            if equiv.to_course:
                equivalent_codes.add(equiv.to_course.code)
        
        for equiv in to_equivalencies:
            if equiv.from_course:
                equivalent_codes.add(equiv.from_course.code)
        
        return equivalent_codes
    
    @staticmethod
    def get_all_transitive_equivalents(course_code, institution=None):
        """
        Get all transitively equivalent courses using BFS.
        
        If A=B and B=C, then A, B, and C are all equivalent.
        
        Args:
            course_code: Starting course code
            institution: Optional institution filter
            
        Returns:
            Set of all transitively equivalent course codes
        """
        visited = set()
        to_visit = {course_code}
        all_equivalents = set()
        
        while to_visit:
            current_code = to_visit.pop()
            if current_code in visited:
                continue
            
            visited.add(current_code)
            all_equivalents.add(current_code)
            
            # Get direct equivalents of current course
            direct_equivalents = PrerequisiteService.get_equivalent_courses(
                current_code, institution
            )
            
            # Add unvisited equivalents to the queue
            for equiv_code in direct_equivalents:
                if equiv_code not in visited:
                    to_visit.add(equiv_code)
        
        return all_equivalents
    
    @staticmethod
    def check_prerequisite_satisfied(
        prerequisite_code,
        completed_courses,
        institution=None
    ):
        """
        Check if a prerequisite is satisfied by completed courses.
        
        A prerequisite is satisfied if:
        1. The student has completed the prerequisite course, OR
        2. The student has completed any course equivalent to the prerequisite
        
        Args:
            prerequisite_code: Required prerequisite course code
            completed_courses: List of PlanCourse objects with status='completed'
            institution: Optional institution filter
            
        Returns:
            True if prerequisite is satisfied, False otherwise
        """
        # Get all courses equivalent to the prerequisite
        equivalent_codes = PrerequisiteService.get_all_transitive_equivalents(
            prerequisite_code, institution
        )
        
        # Check if student has completed any equivalent course
        for plan_course in completed_courses:
            if plan_course.course and plan_course.course.code in equivalent_codes:
                return True
        
        return False
    
    @staticmethod
    def validate_prerequisites(
        target_course_code,
        completed_courses,
        institution=None
    ):
        """
        Validate if a student can take a course based on prerequisites.
        
        Args:
            target_course_code: Course the student wants to take
            completed_courses: List of PlanCourse objects with status='completed'
            institution: Optional institution filter
            
        Returns:
            Dictionary with validation results:
            {
                'can_take': bool,
                'missing_prerequisites': [list of missing course codes],
                'satisfied_prerequisites': [list of satisfied course codes],
                'all_prerequisites': [list of all required course codes]
            }
        """
        # Find the target course
        query = Course.query.filter(Course.code == target_course_code)
        if institution:
            query = query.filter(Course.institution == institution)
        
        course = query.first()
        
        if not course:
            return {
                'can_take': False,
                'error': f'Course {target_course_code} not found',
                'missing_prerequisites': [],
                'satisfied_prerequisites': [],
                'all_prerequisites': []
            }
        
        # Parse prerequisites
        prerequisite_codes = PrerequisiteService.parse_prerequisites(
            course.prerequisites
        )
        
        if not prerequisite_codes:
            # No prerequisites required
            return {
                'can_take': True,
                'missing_prerequisites': [],
                'satisfied_prerequisites': [],
                'all_prerequisites': []
            }
        
        # Check each prerequisite
        satisfied = []
        missing = []
        
        for prereq_code in prerequisite_codes:
            if PrerequisiteService.check_prerequisite_satisfied(
                prereq_code, completed_courses, institution
            ):
                satisfied.append(prereq_code)
            else:
                missing.append(prereq_code)
        
        return {
            'can_take': len(missing) == 0,
            'missing_prerequisites': missing,
            'satisfied_prerequisites': satisfied,
            'all_prerequisites': prerequisite_codes
        }
    
    @staticmethod
    def get_prerequisite_details(course_code, institution=None):
        """
        Get detailed prerequisite information for a course.
        
        Args:
            course_code: Course code to check
            institution: Optional institution filter
            
        Returns:
            Dictionary with prerequisite details including equivalent courses
        """
        query = Course.query.filter(Course.code == course_code)
        if institution:
            query = query.filter(Course.institution == institution)
        
        course = query.first()
        
        if not course:
            return {
                'course_code': course_code,
                'found': False,
                'prerequisites': [],
                'prerequisite_details': []
            }
        
        prerequisite_codes = PrerequisiteService.parse_prerequisites(
            course.prerequisites
        )
        
        # Get details for each prerequisite including equivalents
        prerequisite_details = []
        for prereq_code in prerequisite_codes:
            equivalent_codes = PrerequisiteService.get_all_transitive_equivalents(
                prereq_code, institution
            )
            
            prerequisite_details.append({
                'required_code': prereq_code,
                'equivalent_codes': list(equivalent_codes)
            })
        
        return {
            'course_code': course.code,
            'course_title': course.title,
            'institution': course.institution,
            'found': True,
            'prerequisites': prerequisite_codes,
            'prerequisite_details': prerequisite_details
        }
