"""
Test prerequisite validation with equivalencies.

Tests the prerequisite service handling:
1. Direct prerequisites
2. Transitive equivalencies (A=B, B prerequisite of D)
3. Complex prerequisite chains
"""

import pytest
from backend.models import db
from backend.models.course import Course
from backend.models.equivalency import Equivalency
from backend.models.plan import Plan, PlanCourse
from backend.services.prerequisite_service import PrerequisiteService


@pytest.fixture
def prerequisite_test_data(app):
    """
    Create test data for prerequisite validation.
    
    Setup:
    - School 1: MATH 101 -> MATH 201 -> MATH 301
    - School 2: CALC 1 -> CALC 2 -> CALC 3
    - Equivalencies: MATH 101 = CALC 1, MATH 201 = CALC 2, MATH 301 = CALC 3
    """
    with app.app_context():
        # School 1 courses
        math101 = Course(
            code='MATH 101',
            subject_code='MATH',
            course_number='101',
            title='Calculus I',
            credits=3,
            institution='School 1',
            prerequisites=''
        )
        math201 = Course(
            code='MATH 201',
            subject_code='MATH',
            course_number='201',
            title='Calculus II',
            credits=3,
            institution='School 1',
            prerequisites='MATH 101'
        )
        math301 = Course(
            code='MATH 301',
            subject_code='MATH',
            course_number='301',
            title='Calculus III',
            credits=3,
            institution='School 1',
            prerequisites='MATH 201'
        )
        
        # School 2 courses
        calc1 = Course(
            code='CALC 1',
            subject_code='CALC',
            course_number='1',
            title='Calculus I',
            credits=3,
            institution='School 2',
            prerequisites=''
        )
        calc2 = Course(
            code='CALC 2',
            subject_code='CALC',
            course_number='2',
            title='Calculus II',
            credits=3,
            institution='School 2',
            prerequisites='CALC 1'
        )
        calc3 = Course(
            code='CALC 3',
            subject_code='CALC',
            course_number='3',
            title='Calculus III',
            credits=3,
            institution='School 2',
            prerequisites='CALC 2'
        )
        
        db.session.add_all([math101, math201, math301, calc1, calc2, calc3])
        db.session.flush()
        
        # Create equivalencies
        equiv1 = Equivalency(
            from_course_id=math101.id,
            to_course_id=calc1.id,
            equivalency_type='direct'
        )
        equiv2 = Equivalency(
            from_course_id=math201.id,
            to_course_id=calc2.id,
            equivalency_type='direct'
        )
        equiv3 = Equivalency(
            from_course_id=math301.id,
            to_course_id=calc3.id,
            equivalency_type='direct'
        )
        
        db.session.add_all([equiv1, equiv2, equiv3])
        db.session.commit()
        
        yield {
            'math101': math101,
            'math201': math201,
            'math301': math301,
            'calc1': calc1,
            'calc2': calc2,
            'calc3': calc3
        }


def test_parse_prerequisites():
    """Test prerequisite string parsing."""
    # Simple case
    prereqs = PrerequisiteService.parse_prerequisites('MATH 101')
    assert prereqs == ['MATH 101']
    
    # Multiple prerequisites with comma
    prereqs = PrerequisiteService.parse_prerequisites('MATH 101, BIOL 200')
    assert set(prereqs) == {'MATH 101', 'BIOL 200'}
    
    # Multiple prerequisites with "and"
    prereqs = PrerequisiteService.parse_prerequisites('MATH 101 and BIOL 200')
    assert set(prereqs) == {'MATH 101', 'BIOL 200'}
    
    # Course codes without spaces
    prereqs = PrerequisiteService.parse_prerequisites('MATH101, BIOL200')
    assert set(prereqs) == {'MATH 101', 'BIOL 200'}
    
    # Empty/None
    assert PrerequisiteService.parse_prerequisites('') == []
    assert PrerequisiteService.parse_prerequisites(None) == []


def test_direct_prerequisite_check(app, prerequisite_test_data):
    """Test checking a direct prerequisite."""
    with app.app_context():
        math101 = prerequisite_test_data['math101']
        math201 = prerequisite_test_data['math201']
        
        # Create a plan with completed MATH 101
        plan = Plan(
            student_name='Test Student',
            current_program_id=1,
            target_program_id=1
        )
        db.session.add(plan)
        db.session.flush()
        
        completed_course = PlanCourse(
            plan_id=plan.id,
            course_id=math101.id,
            status='completed',
            semester='Fall',
            year=2024
        )
        db.session.add(completed_course)
        db.session.commit()
        
        # Validate MATH 201 (requires MATH 101)
        completed_courses = [completed_course]
        result = PrerequisiteService.validate_prerequisites(
            'MATH 201',
            completed_courses
        )
        
        assert result['can_take'] is True
        assert 'MATH 101' in result['satisfied_prerequisites']
        assert len(result['missing_prerequisites']) == 0


def test_missing_prerequisite(app, prerequisite_test_data):
    """Test detecting missing prerequisites."""
    with app.app_context():
        # Create a plan with no completed courses
        plan = Plan(
            student_name='Test Student',
            current_program_id=1,
            target_program_id=1
        )
        db.session.add(plan)
        db.session.commit()
        
        # Try to validate MATH 201 without MATH 101
        result = PrerequisiteService.validate_prerequisites(
            'MATH 201',
            []  # No completed courses
        )
        
        assert result['can_take'] is False
        assert 'MATH 101' in result['missing_prerequisites']
        assert len(result['satisfied_prerequisites']) == 0


def test_transitive_equivalency_prerequisite(app, prerequisite_test_data):
    """
    Test transitive equivalency handling.
    
    If MATH 101 = CALC 1 (equivalent), and student completed CALC 1,
    they should be able to take MATH 201 (which requires MATH 101).
    """
    with app.app_context():
        calc1 = prerequisite_test_data['calc1']
        
        # Create a plan with completed CALC 1 (School 2)
        plan = Plan(
            student_name='Test Student',
            current_program_id=1,
            target_program_id=1
        )
        db.session.add(plan)
        db.session.flush()
        
        completed_course = PlanCourse(
            plan_id=plan.id,
            course_id=calc1.id,
            status='completed',
            semester='Fall',
            year=2024
        )
        db.session.add(completed_course)
        db.session.commit()
        
        # Validate MATH 201 (requires MATH 101, but CALC 1 is equivalent)
        completed_courses = [completed_course]
        result = PrerequisiteService.validate_prerequisites(
            'MATH 201',
            completed_courses
        )
        
        assert result['can_take'] is True, \
            f"Should be able to take MATH 201 with CALC 1 completed. Result: {result}"
        assert 'MATH 101' in result['all_prerequisites']
        assert 'MATH 101' in result['satisfied_prerequisites']


def test_cross_institution_prerequisite_chain(app, prerequisite_test_data):
    """
    Test complex cross-institution prerequisite chain.
    
    Student completes:
    - CALC 1 at School 2 (equiv to MATH 101)
    - MATH 201 at School 1
    
    Can they take CALC 3 at School 2 (requires CALC 2, equiv to MATH 201)?
    """
    with app.app_context():
        calc1 = prerequisite_test_data['calc1']
        math201 = prerequisite_test_data['math201']
        
        # Create a plan with completed CALC 1 and MATH 201
        plan = Plan(
            student_name='Test Student',
            current_program_id=1,
            target_program_id=1
        )
        db.session.add(plan)
        db.session.flush()
        
        completed1 = PlanCourse(
            plan_id=plan.id,
            course_id=calc1.id,
            status='completed',
            semester='Fall',
            year=2024
        )
        completed2 = PlanCourse(
            plan_id=plan.id,
            course_id=math201.id,
            status='completed',
            semester='Spring',
            year=2025
        )
        db.session.add_all([completed1, completed2])
        db.session.commit()
        
        # Validate CALC 3 (requires CALC 2, which is equivalent to MATH 201)
        completed_courses = [completed1, completed2]
        result = PrerequisiteService.validate_prerequisites(
            'CALC 3',
            completed_courses
        )
        
        assert result['can_take'] is True, \
            f"Should be able to take CALC 3 with MATH 201 completed. Result: {result}"
        assert 'CALC 2' in result['satisfied_prerequisites']


def test_partial_prerequisites(app, prerequisite_test_data):
    """Test course with multiple prerequisites, some met and some not."""
    with app.app_context():
        # Create a course with multiple prerequisites
        advanced_course = Course(
            code='MATH 401',
            subject_code='MATH',
            course_number='401',
            title='Advanced Calculus',
            credits=3,
            institution='School 1',
            prerequisites='MATH 201, MATH 301'  # Multiple prerequisites
        )
        db.session.add(advanced_course)
        
        math201 = prerequisite_test_data['math201']
        
        # Create a plan with only MATH 201 completed
        plan = Plan(
            student_name='Test Student',
            current_program_id=1,
            target_program_id=1
        )
        db.session.add(plan)
        db.session.flush()
        
        completed_course = PlanCourse(
            plan_id=plan.id,
            course_id=math201.id,
            status='completed',
            semester='Fall',
            year=2024
        )
        db.session.add(completed_course)
        db.session.commit()
        
        # Validate MATH 401 (should fail - missing MATH 301)
        completed_courses = [completed_course]
        result = PrerequisiteService.validate_prerequisites(
            'MATH 401',
            completed_courses
        )
        
        assert result['can_take'] is False
        assert 'MATH 201' in result['satisfied_prerequisites']
        assert 'MATH 301' in result['missing_prerequisites']


def test_get_equivalent_courses(app, prerequisite_test_data):
    """Test finding all equivalent courses."""
    with app.app_context():
        # Get equivalents for MATH 101
        equivalents = PrerequisiteService.get_all_transitive_equivalents('MATH 101')
        
        assert 'MATH 101' in equivalents
        assert 'CALC 1' in equivalents
        assert len(equivalents) == 2


def test_prerequisite_details(app, prerequisite_test_data):
    """Test getting detailed prerequisite information."""
    with app.app_context():
        details = PrerequisiteService.get_prerequisite_details('MATH 201')
        
        assert details['found'] is True
        assert details['course_code'] == 'MATH 201'
        assert 'MATH 101' in details['prerequisites']
        
        # Check that prerequisite details include equivalents
        prereq_detail = details['prerequisite_details'][0]
        assert prereq_detail['required_code'] == 'MATH 101'
        assert 'CALC 1' in prereq_detail['equivalent_codes']


def test_no_prerequisites(app):
    """Test course with no prerequisites."""
    with app.app_context():
        # Create a course with no prerequisites
        course = Course(
            code='ENGL 101',
            subject_code='ENGL',
            course_number='101',
            title='English Composition',
            credits=3,
            institution='School 1',
            prerequisites=None
        )
        db.session.add(course)
        db.session.commit()
        
        result = PrerequisiteService.validate_prerequisites(
            'ENGL 101',
            []  # No completed courses
        )
        
        assert result['can_take'] is True
        assert len(result['missing_prerequisites']) == 0
        assert len(result['all_prerequisites']) == 0


def test_course_not_found(app):
    """Test validation for non-existent course."""
    with app.app_context():
        result = PrerequisiteService.validate_prerequisites(
            'FAKE 999',
            []
        )
        
        assert result['can_take'] is False
        assert 'error' in result
        assert 'not found' in result['error'].lower()
